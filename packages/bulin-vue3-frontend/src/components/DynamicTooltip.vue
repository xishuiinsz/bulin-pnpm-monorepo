<script setup>
import { ElTooltip } from 'element-plus';
import { onMounted, ref } from 'vue';

const disabled = ref(true);
const content = ref('');

let ob = null;

function mountedEvent(e) {
  const check = (element) => {
    if (element) {
      if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) {
        disabled.value = false;
        content.value = element.textContent;
      }
      else {
        disabled.value = true;
        content.value = '';
      }
    }
  };
  const child = e.el?.children?.[0];
  check(child);

  ob = new ResizeObserver((entries) => {
    const element = entries?.[0]?.target;
    check(element);
  });

  ob.observe(child);
}

onMounted(() => {
  ob?.disconnect();
});
</script>

<template>
  <ElTooltip :disabled="disabled" :content="content" v-bind="$attrs">
    <div class="width-fit-content" @vue:mounted="mountedEvent">
      <slot />
    </div>
  </ElTooltip>
</template>
