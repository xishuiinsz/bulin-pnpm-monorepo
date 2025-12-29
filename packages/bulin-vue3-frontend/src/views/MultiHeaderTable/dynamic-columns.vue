<script setup lang="ts">
import { ElTableColumn } from 'element-plus';
import { h, computed } from 'vue';

interface TableColumn {
    prop?: string;
    label: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    fixed?: boolean | 'left' | 'right';
    formatter?: (row: any, column: any, cellValue: any, index: number) => string;
    sortable?: boolean | 'custom';
    children?: TableColumn[];
};

const props = defineProps<{
    list: TableColumn[];
    getConfigs?: (column: TableColumn['prop']) => TableColumn & { slots?: Record<string, (scope: any) => any>}

}>();

// 动态列组件（使用渲染函数）
const DynamicColumn = (data: TableColumn) => {
    const renderColumn = (col) => {
        const { children, ...rest } = col;
        if (children?.length) {
            return h(
                ElTableColumn,
                rest,
                () => col.children.map((child: TableColumn) => renderColumn(child))
            );
        }
        const { slots, ...restConfigs } = props.getConfigs?.(rest.prop) || {};
        
        // 叶子列
        return h(ElTableColumn, {
            ...rest, ...restConfigs
        }, {
            ...slots
        });
    };

    return renderColumn(data);
};
</script>

<template>
    <template v-for="column in props.list" :key="column.prop || column.label">
        <dynamic-column v-bind="column" />
    </template>
</template>