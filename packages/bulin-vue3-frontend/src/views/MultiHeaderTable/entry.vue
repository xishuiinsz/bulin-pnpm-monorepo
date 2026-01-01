<script setup lang="ts">
import { tableColumns, tableData, type TableRow } from '@/components/dynamic-columns/utils';
import { ElTable } from 'element-plus';
import { reactive } from 'vue';
import DynamicColumns from '@/components/dynamic-columns/DynamicColumns.vue';

defineOptions({
    name: 'MultiHeaderTableView',
});

const columnsList = reactive(tableColumns)

const getConfigs = (key: string) => {
    if (key === 'name') {
        return {
            width: 200
        };
    };
    return {
        slots: {
            default: (data: { row: TableRow }) => `hi: ${data.row[key]}`
        }

    };
}
</script>

<template>
    <div class="multi-header-table-view p-4">
        <el-table :data="tableData" style="width: 100%" border>
            <DynamicColumns :list="columnsList" :get-configs="getConfigs" />
        </el-table>
    </div>
</template>
