<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted, ref, unref } from 'vue';

interface Props {
  rows?: number;
  content: string;
  moreText?: string;
  moreClick?: () => void;
}
const { rows = 2, content, moreText = '更多', moreClick = () => { } } = defineProps<Props>();

const instance = getCurrentInstance();
const shownContent = ref(content);
const cachedData = { ob: null };

function resizeCallback() {
  shownContent.value = content;
  computingShowContent();
}

function computingShowContent() {
  setTimeout(() => {
    const container = instance.proxy.$el;
    if (container?.scrollHeight > container?.offsetHeight) {
      const newContent = unref(shownContent).slice(0, unref(shownContent).length - 1);
      shownContent.value = newContent;
      computingShowContent();
    }
  });
}
function clickEvt() {
  if (!cachedData.ob) {
    const container = instance.proxy.$el;
    cachedData.ob = new ResizeObserver(resizeCallback);
    cachedData.ob?.observe?.(container);
  }
}
onMounted(computingShowContent);
window.addEventListener('click', clickEvt, { once: true, capture: true });
onUnmounted(() => {
  cachedData.ob?.disconnect?.();
  window.removeEventListener('click', clickEvt);
});
</script>

<template>
  <div class="multi-text-with-more w-100">
    <span>{{ shownContent }}</span>
    <span v-if="content.length !== shownContent.length">...</span>
    <span class=" color-3a85ff cursor-pointer ps-1" @click.stop="moreClick">{{ moreText }}</span>
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
