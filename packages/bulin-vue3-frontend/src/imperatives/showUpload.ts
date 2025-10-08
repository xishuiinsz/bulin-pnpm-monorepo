import type { UploadInstance } from 'element-plus';
import { ElUpload } from 'element-plus';
import { createApp, ref } from 'vue';

function showUpload(options = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const config = {
    'show-file-list': false,
    'auto-upload': false,
    'multiple': false,
    'limit': 1,
    'accept': 'image/*',
    ...options,
  };
  const customApp = createApp(ElUpload, config);
  customApp.mount(container);
  const selector = 'input[type="file"]';
  const input = container.querySelector(selector) as HTMLInputElement;
  input.click();
  const destroy = () => {
    customApp.unmount();
    document.body.removeChild(container);
  };

  return { destroy };
}

export default showUpload;
