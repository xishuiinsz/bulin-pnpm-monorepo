<script setup lang="ts">
import { tableColumns, tableData } from './utils';
import { ElTable } from 'element-plus';
import { h, computed } from 'vue';
import DynamicColumns from './dynamic-columns.vue';

defineOptions({
    name: 'MultiHeaderTableView',
});

const props = defineProps({
    tableData: {
        type: Array,
        default: () => []
    },
    tableColumns: {
        type: Array,
        default: () => []
    }
});

// 可以在这里添加列处理逻辑
const processedColumns = computed(() => {
    return tableColumns.map(column => ({
        ...column,
        align: column.align || 'center'
    }));
});

const getConfigs = (key: string) => {
    return {
        slots: {
            default: (data) => `hi: ${data.row[key]}`
        }

    };
}
</script>

<template>
    <div class="multi-header-table-view">
        <el-table :data="tableData" style="width: 100%" border>
            <dynamic-columns :list="processedColumns" :get-configs="getConfigs" />
        </el-table>
    </div>
</template>
