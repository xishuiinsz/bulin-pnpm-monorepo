import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { app, BrowserWindow, ipcMain } from 'electron';

/**
 * Electron 主进程入口。
 * tsc 把 src/*.ts 编译到 dist/，package.json 的 "main": "dist/main.js" 即本文件的产物。
 * 启动方式必须是 `electron .`（不能用 node 直接跑，否则 require('electron') 拿到的是 exe 路径字符串）。
 */

/** 渲染进程页面：静态文件，不参与 tsc 编译，所以从 dist 往上一级取 */
const RENDERER_HTML = join(__dirname, '..', 'renderer', 'index.html');
/** preload 脚本：与本文件同在 dist 下 */
const PRELOAD_JS = join(__dirname, 'preload.js');
/** Win11 自带的 Windows PowerShell 5.1，路径固定，不需要额外依赖 */
const POWERSHELL_EXE = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
/** 强制 UTF-8 输出，否则中文系统取到的是 GBK，会变成乱码 */
const UTF8_PREFIX = '[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;';

export interface SystemInfo {
  osCaption: string;
  osVersion: string;
  osBuild: string;
  lastBootUpTime: string;
  user: string;
  hostname: string;
  electron: string;
  node: string;
  chrome: string;
}

/** 执行一段 PowerShell 并返回 stdout（已 trim） */
function runPowerShell(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    execFile(
      POWERSHELL_EXE,
      ['-NoProfile', '-NonInteractive', '-Command', `${UTF8_PREFIX} ${command}`],
      { encoding: 'utf8', windowsHide: true, timeout: 15_000 },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout.trim());
      },
    );
  });
}

/** 采集 Windows 11 系统信息：一次调用拿全，避免反复拉起 powershell 进程 */
async function collectSystemInfo(): Promise<SystemInfo> {
  const script = [
    '$os = Get-CimInstance Win32_OperatingSystem;',
    '$cs = Get-CimInstance Win32_ComputerSystem;',
    '"$($os.Caption)|$($os.Version)|$($os.BuildNumber)|' +
      "$($os.LastBootUpTime.ToString('yyyy-MM-dd HH:mm:ss'))|$env:USERNAME|$($cs.Name)\"",
  ].join(' ');

  const raw = await runPowerShell(script);
  const parts = raw.split('|');
  // tsconfig 开了 noUncheckedIndexedAccess，用默认值兜住 undefined
  const [
    osCaption = '',
    osVersion = '',
    osBuild = '',
    lastBootUpTime = '',
    user = '',
    hostname = '',
  ] = parts;

  return {
    osCaption,
    osVersion,
    osBuild,
    lastBootUpTime,
    user,
    hostname,
    electron: process.versions.electron ?? '',
    node: process.versions.node,
    chrome: process.versions.chrome ?? '',
  };
}

// 渲染进程通过 preload 暴露的 childGuardian.getSystemInfo() 调到这里
ipcMain.handle('system:get-info', async (): Promise<SystemInfo> => {
  try {
    return await collectSystemInfo();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[system:get-info] 采集失败:', message);
    throw new Error(message);
  }
});

function createMainWindow(): void {
  console.log('[main] 渲染页面路径:', RENDERER_HTML, existsSync(RENDERER_HTML) ? '(存在)' : '(不存在!)');

  const win = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: 640,
    minHeight: 480,
    title: '儿童守护中心',
    autoHideMenuBar: true,
    webPreferences: {
      preload: PRELOAD_JS,
      // Electron 官方推荐的安全组合：渲染进程无 Node 权限，只能经 preload 白名单通信
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.on('did-finish-load', () => {
    console.log('[renderer] 页面加载完成:', win.webContents.getURL());
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[renderer] 加载失败:', errorCode, errorDescription, validatedURL);
  });

  win.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error('[preload] 执行失败:', preloadPath, error);
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[renderer] 渲染进程异常退出:', details.reason, details.exitCode);
  });

  win.on('closed', () => {
    console.log('[main] 主窗口已关闭');
  });

  if (process.env['NODE_ENV'] === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  void win.loadFile(RENDERER_HTML);
}

app.on('before-quit', () => {
  console.log('[main] 应用即将退出');
});

process.on('uncaughtException', (error) => {
  console.error('[main] uncaughtException:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[main] unhandledRejection:', reason);
});

/**
 * 无界面自检：`electron . --selftest` 只采集一次系统信息、打印 JSON 后退出，
 * 用于脚本 / CI 验证主进程的 PowerShell 链路，不弹窗。
 */
async function runSelfTest(): Promise<void> {
  try {
    const info = await collectSystemInfo();
    console.log('[selftest] OK', JSON.stringify(info));
  } catch (error) {
    console.error('[selftest] FAILED', error);
    process.exitCode = 1;
  }
  app.quit();
}

void app.whenReady().then(() => {
  console.log(`[child-guardian-center] Electron ${process.versions.electron} 已就绪`);

  if (process.argv.includes('--selftest')) {
    void runSelfTest();
    return;
  }

  createMainWindow();

  // macOS：点击 Dock 图标且无窗口时重建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Windows / Linux：所有窗口关闭即退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

