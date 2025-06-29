import hljs from 'highlight.js/lib/core';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { computed, nextTick, onUnmounted, reactive, ref, watch } from 'vue';

import 'highlight.js/styles/github.css';
import 'highlight.js/styles/paraiso-light.css';

export default {
  path: '/ai-chat-assiant',
  title: 'AI 聊天助手',
  icon: 'icon-mock-stream-output',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

const scrollContainer = '.scroll-container';
export const inAnsweringKey = 'inAnswering';

// 非响应式数据缓存
export const cachedData = {
  hasScroll: false,
};

export const messageList = reactive([]);

// 是否有应答中的消息
export const hasAnswering = computed(() => {
  if (messageList.length) {
    return messageList.some(item => item[inAnsweringKey]);
  }
  return false;
});

export function goToBottom(selector = scrollContainer) {
  const container = document.querySelector(selector);
  if (container?.scrollHeight > container?.clientHeight) {
    container.scrollTop = container.scrollHeight - container.clientHeight;
  }
}

export function wheelEvt() {
  Object.assign(cachedData, { hasScroll: true });
}

export function useObserveAnswering() {
  let target;
  let observer;
  const moveTarget = () => {
    const scrollContainerElement = document.querySelector(scrollContainer);
    const { bottom: scrollContainerBottom } = scrollContainerElement.getBoundingClientRect();
    if (target) {
      const { bottom: targetBottom } = target.getBoundingClientRect();
      if (targetBottom > scrollContainerBottom && !cachedData.hasScroll) {
        scrollContainerElement.scrollTop = scrollContainerElement.scrollTop + targetBottom - scrollContainerBottom;
      }
    }
  };
  const startObserve = () => {
    observer = new ResizeObserver(moveTarget);
    target = document.querySelector('.message-list-container .message-item.in-answering');
    if (target) {
      observer.observe(target);
    }
    else {
      console.warn('No element found to observe for height changes.');
    }
  };

  const stopObserve = () => {
    if (observer && target) {
      observer.unobserve(target);
      observer.disconnect();
    }
  };

  const hasAnsweringChanged = (newValue, oldValue) => {
    if (oldValue === false && newValue === true) {
      startObserve();
    }
    if (oldValue === true && newValue === false) {
      stopObserve();
      moveTarget();
    }
  };
  const stopWatch = watch(hasAnswering, hasAnsweringChanged, { flush: 'post' });
  onUnmounted(stopWatch);
  return { startObserve, stopObserve };
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

export function getMarkedAnswer(answer) {
  marked.use({
    pedantic: false,
    gfm: true,
    breaks: false,
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  });
  return marked.parse(answer);
}
