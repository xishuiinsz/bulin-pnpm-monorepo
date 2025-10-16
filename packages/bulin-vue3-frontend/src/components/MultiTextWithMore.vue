<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted, ref, unref } from 'vue';

interface Props {
  rows?: number;
  content: string;
  moreText?: string;
  moreClick?: () => void;
}
const { rows, content, moreText, moreClick } = withDefaults(defineProps<Props>(), {
  rows: 2,
  moreText: '更多',
  moreClick: () => { },
});

const instance = getCurrentInstance();
const shownContent = ref(content);
const cachedData = { ob: null };

function resizeCallback() {
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
    else {
      if (!cachedData.ob) {
        cachedData.ob = new ResizeObserver(resizeCallback);
        cachedData.ob.observe(container);
      }
    }
  });
}

onMounted(computingShowContent);
onUnmounted(() => {
  cachedData.ob?.disconnect?.();
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
