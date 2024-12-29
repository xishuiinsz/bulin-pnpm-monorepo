import { getCurrentInstance, onMounted } from 'vue';

export function getElementById(id, container) {
  return container.querySelector(`[data-id="${id}"]`);
}

/**
 * 获取图片的地址
 * @param name 基于assets/img/文件夹下的位置
 * @returns 图片地址
 */
export function getImageUrlByName(name: string) {
  return new URL(`../../assets/img/${name}`, import.meta.url).href;
}

export function useImagesLoaded(callback: () => void): void {
  const instance = getCurrentInstance();
  const init = () => {
    const target = instance.proxy.$el;
    if (target) {
      const imgElements = target.querySelectorAll('img');
      const checkFinish = (images: NodeListOf<HTMLImageElement>) => {
        requestAnimationFrame(() => {
          const status = Array.from(images)
            .map((item: HTMLImageElement) => item.complete)
            .filter((item: boolean) => !item);
          if (status.length) {
            checkFinish(images);
          } else {
            typeof callback === 'function' && callback();
          }
        });
      };
      checkFinish(imgElements);
    }
  };
  onMounted(init);
}
