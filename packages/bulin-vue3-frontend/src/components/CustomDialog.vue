<script setup lang="ts">
import { h, useAttrs } from 'vue';
import { ElDialog, type DialogProps } from 'element-plus';

interface Props {
    renderOnMounted?: boolean;
}

const { renderOnMounted = false } = defineProps<Props>();

const attrs = useAttrs();

const defaultProps = { appendToBody: true, destroyOnClose: true }

defineExpose<DialogProps>();

</script>
<template>
    <template v-if="renderOnMounted || attrs.modelValue">
        <component :is="h(ElDialog, { ...defaultProps, ...attrs }, $slots)" />
    </template>
</template>