import { onUnmounted } from 'vue';

// 创建一个Web Worker实例
function createWorker(workerScript) {
  const blob = new Blob([`(${workerScript.toString()})()`], { type: 'text/javascript' });
  const url = window.URL.createObjectURL(blob);
  return new Worker(url);
}

function useWebWorker(workerScript) {
  if (typeof workerScript !== 'function') {
    throw new TypeError('workerScript must be a function');
  }
  const worker = createWorker(workerScript);
  const data = { message: null };

  worker.onmessage = (e) => {
    Object.assign(data, { message: e, error: null });
  };

  worker.onerror = (e) => {
    Object.assign(data, { message: null, error: e });
  };

  const postMessage = msg => worker.postMessage(msg);

  onUnmounted(() => worker.terminate());

  return { postMessage, data };
}

export default useWebWorker;
