<script setup lang="ts">
import { ElTableColumn } from 'element-plus';
import { h, type VNode } from 'vue';
import { type ElTableColumnProps } from './utils';
import { merge } from 'lodash';

const props = defineProps<{
    list: ElTableColumnProps[];
    getConfigs?: (p: string) => unknown

}>();

// 动态列组件（使用渲染函数）
const DynamicColumn = (data: ElTableColumnProps) => {
    const renderColumn = (col: ElTableColumnProps): VNode => {
        const { children, ...restData } = col;
        if (children?.length) {
            return h(
                ElTableColumn,
                restData,
                () => children.map(renderColumn)
            );
        }
        const { slots = {}, ...restProps } = merge({}, restData, props.getConfigs?.(restData.prop as string) ?? {});
        // 叶子列
        return h(ElTableColumn, restProps, slots);
    };
    return renderColumn(data);
};
</script>

<template>
    <template v-for="column in props.list" :key="column.prop || column.label">
        <DynamicColumn v-bind="column" />
    </template>
</template>