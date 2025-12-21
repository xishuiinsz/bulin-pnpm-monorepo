<script setup lang="ts">
import { ElTableColumn } from 'element-plus';
import { h } from 'vue';

interface ColumnItemProp {
  prop: string;
  label: string;
  slots?: any;
}

const { list, getConfigByProp, getSlotsByProp } = defineProps<{
  list: ColumnItemProp[];
  getConfigByProp?: (prop: ColumnItemProp['prop']) => any | undefined;
  getSlotsByProp?: (prop: ColumnItemProp['prop']) => any | undefined;
}>();

const getColumnProps = (data: ColumnItemProp) => {
  const { slots, ...props } = data;
  if (typeof getConfigByProp === 'function') {
    Object.assign(props, getConfigByProp(data.prop))
  }
  return props
};
const getColumnSlots = (data: ColumnItemProp) => {
  const { slots } = data;
  if (typeof getSlotsByProp === 'function') {
    Object.assign(slots, getSlotsByProp(data.prop))
  }
  return slots
};
</script>

<template>
  <slot name="prefix" />
  <component :is="h(ElTableColumn, getColumnProps(item), getColumnSlots(item))" v-for="item in list"
    :key="item.prop" />
  <slot name="suffix" />
</template>
