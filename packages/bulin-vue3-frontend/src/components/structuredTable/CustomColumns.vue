<script setup lang="ts">
import { ElTableColumn } from 'element-plus';
import { h } from 'vue';

interface ColumnItemProp {
  prop: string;
  label: string;
  slots?: any;
}

const { list, getConfigByProp = () => ({}) } = defineProps<{
  list: ColumnItemProp[];
  getConfigByProp?: (prop: ColumnItemProp['prop']) => any;
}>();
</script>

<template>
  <slot name="prefix" />
  <component
    :is="h(ElTableColumn, { ...rest, ...getConfigByProp(rest.prop) }, { ...slots })"
    v-for="{ slots = {}, ...rest } in list" :key="rest.prop"
  />
  <slot name="suffix" />
</template>
