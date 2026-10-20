import { contextBridge, ipcRenderer } from 'electron';

/**
 * preload 脚本：运行在渲染进程的隔离上下文里。
 * 因为 webPreferences.sandbox = true，这里只能用 require('electron')，
 * 不能引 node:os / node:child_process 等内置模块（需要的话请放到主进程用 IPC 暴露）。
 */
contextBridge.exposeInMainWorld('childGuardian', {
  /** 取 Windows 系统信息，实际由主进程的 system:get-info handler 执行 */
  getSystemInfo: (): Promise<unknown> => ipcRenderer.invoke('system:get-info'),
});
