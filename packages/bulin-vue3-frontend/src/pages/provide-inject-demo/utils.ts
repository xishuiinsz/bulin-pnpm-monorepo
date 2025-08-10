import { type InjectionKey, provide } from 'vue';

interface InjectionData { title: string; click: (value: string) => void }

export const injectKey = Symbol('injectKey') as InjectionKey<InjectionData>;

function usePageHook() {
  function click(value) {
    console.log('click value: ', value);
  }
  const title = 'This is provided data from the parent component';
  const providedData = { title, click };
  provide(injectKey, providedData);
  return providedData;
}

export default usePageHook;
