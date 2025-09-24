<script setup lang="ts">
import { ElTableColumn } from 'element-plus';
import { h } from 'vue';

interface ColumnItemProp {
  prop: string;
  label: string;
  slots?: any;
}

const { list, getConfigByProp = () => ({}), getSlotsByProp = () => ({}) } = defineProps<{
  list: ColumnItemProp[];
  getConfigByProp?: (prop: ColumnItemProp['prop']) => any;
  getSlotsByProp?: (prop: ColumnItemProp['prop']) => any;
}>();
</script>

<template>
  <slot name="prefix" />
  <component
    :is="h(ElTableColumn, { ...rest, ...getConfigByProp(rest.prop) }, { ...slots, ...getSlotsByProp(rest.prop) })"
    v-for="{ slots = {}, ...rest } in list" :key="rest.prop"
  />
  <slot name="suffix" />
</template>
