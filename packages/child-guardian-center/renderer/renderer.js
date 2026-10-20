// 渲染进程脚本：跑在 sandbox 里，没有 Node 能力，
// 只能通过 preload 注入的 window.childGuardian 与主进程通信。
const infoEl = document.getElementById('info');
const statusEl = document.getElementById('status');
const refreshBtn = document.getElementById('refresh');

const LABELS = {
  osCaption: '系统',
  osVersion: '内核版本',
  osBuild: '构建号',
  lastBootUpTime: '上次开机',
  user: '当前用户',
  hostname: '计算机名',
  electron: 'Electron',
  chrome: 'Chromium',
  node: 'Node（主进程）',
};

function render(info) {
  infoEl.textContent = '';
  for (const [key, label] of Object.entries(LABELS)) {
    const row = document.createElement('div');
    row.className = 'row';

    const keyEl = document.createElement('span');
    keyEl.className = 'key';
    keyEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'value';
    valueEl.textContent = info[key] || '—';

    row.append(keyEl, valueEl);
    infoEl.append(row);
  }
}

async function refresh() {
  refreshBtn.disabled = true;
  statusEl.textContent = '正在通过 PowerShell 读取系统信息…';
  try {
    const info = await window.childGuardian.getSystemInfo();
    render(info);
    statusEl.textContent = `读取成功 · ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    statusEl.textContent = `读取失败：${error.message}`;
  } finally {
    refreshBtn.disabled = false;
  }
}

refreshBtn.addEventListener('click', () => void refresh());
void refresh();
