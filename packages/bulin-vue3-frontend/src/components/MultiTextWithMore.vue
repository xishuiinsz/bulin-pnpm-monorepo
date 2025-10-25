<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, unref, watch } from 'vue';

interface Props {
  rows?: number;
  content: string;
  moreText?: string;
  moreClick?: () => void;
}
const { rows = 2, content, moreText = '更多', moreClick = () => { } } = defineProps<Props>();

const instance = getCurrentInstance();
const shownContent = ref(content);
const ellipsisStr = '...';
const cachedData = { startIndex: 0, endIndex: content.length, ob: null, stopWatch: null, flagResizeObserver: false };

function addListenner(container) {
  if (!cachedData.ob) {
    cachedData.ob = new ResizeObserver(() => {
      // 首次触发不处理，避免初始渲染时重复计算
      if (!cachedData.flagResizeObserver) {
        cachedData.flagResizeObserver = true;
      } else {
        resizeCallback()
      }
    });
  }
  cachedData.ob.observe(container);
  watch(() => content, resizeCallback);
}

function computingShowContent() {
  const container = instance.proxy.$el
  if (cachedData.endIndex - cachedData.startIndex <= 0) {
    addListenner(container);
    return;
  }
  if (container?.scrollHeight > container?.offsetHeight) {
    cachedData.endIndex = cachedData.startIndex + Math.floor((cachedData.endIndex - cachedData.startIndex) / 2);
  } else {
    const endIndex = cachedData.endIndex;
    cachedData.endIndex = endIndex + Math.floor((endIndex - cachedData.startIndex) / 2);
    cachedData.startIndex = endIndex;
  }
  shownContent.value = content.slice(0, cachedData.endIndex);
  requestAnimationFrame(computingShowContent);
}

function resizeCallback() {
  cachedData.startIndex = 0;
  cachedData.endIndex = content.length;
  shownContent.value = content;
  nextTick(init);
}

const init = () => {
  const container = instance.proxy.$el;
  if (container?.scrollHeight > container?.offsetHeight) {
    requestAnimationFrame(computingShowContent);
  }
}

onMounted(init);

onUnmounted(() => {
  cachedData.ob?.disconnect?.();
  cachedData.stopWatch?.();
});
</script>

<template>
  <div class="multi-text-with-more w-100">
    <span>{{ shownContent }}</span>
    <span v-if="content.length !== shownContent.length">{{ ellipsisStr }}</span>
    <span class=" color-3a85ff cursor-pointer ps-2" @click.stop="moreClick">{{ moreText }}</span>
  </div>
</template>

<style lang="scss" scoped>
.multi-text-with-more {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: v-bind(rows);
  -webkit-line-clamp: v-bind(rows);
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
