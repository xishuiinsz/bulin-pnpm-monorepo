import { nextTick, reactive, ref } from 'vue';

export default {
  path: '/ai-chat-assiant',
  title: 'AI 聊天助手',
  icon: 'icon-mock-stream-output',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

const scrollContainer = '.scroll-container';

// 非响应式数据缓存
export const cachedData = {
  hasScroll: false,
};

export const messageList = reactive([]);

export function goToBottom(selector = scrollContainer) {
  const container = document.querySelector(selector);
  if (container?.scrollHeight > container?.clientHeight) {
    container.scrollTop = container.scrollHeight - container.clientHeight;
  }
}

export function wheelEvt() {
  Object.assign(cachedData, { hasScroll: true });
}

export function useObserveAnsweringHeight() {
  const scrollContainerElement = document.querySelector(scrollContainer);
  const { bottom: scrollContainerBottom } = scrollContainerElement.getBoundingClientRect();

  const observer = new ResizeObserver((entries) => {
    const { bottom: elementBottom } = entries[0].target.getBoundingClientRect();
    if (elementBottom > scrollContainerBottom && !cachedData.hasScroll) {
      goToBottom();
    }
  });
  const target = document.querySelector('.message-list-container .message-item.in-answering');

  const startObserve = () => {
    if (target) {
      observer.observe(target);
    }
    else {
      console.warn('No element found to observe for height changes.');
    }
  };

  const terminateObserve = () => {
    observer.unobserve(target);
  };

  return { startObserve, terminateObserve };
}

export function focusInput() {
  const inputElement = document.querySelector('.question-input textarea');
  if (inputElement) {
    inputElement.focus();
  }
  else {
    console.warn('Input element not found.');
  }
}
