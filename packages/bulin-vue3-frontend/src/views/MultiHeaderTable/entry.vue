<script setup lang="ts">
import { reactive, ref } from 'vue';
import { columns, tableData } from './utils';
import { ElTable } from 'element-plus';
import DynamicColumns from '@/components/dynamic-columns/DynamicColumns.vue';
import CustomDialog from '@c/CustomDialog.vue';
import DetailsForm from './DetailsForm.vue';

defineOptions({
  name: 'MultiHeaderTableView'
});

type TableRow = Partial<(typeof tableData)[0]>;

const columnsList = reactive(columns);

const getConfigs = (key: string) => {
  if (key === 'name') {
    return {
      width: 200
    };
  }
  return {};
};

const dialogVisible = ref(false);
const cachedData = {
  data: null
};

const handleEdit = (row: TableRow) => {
  dialogVisible.value = true;
  Object.assign(cachedData, {
    data: row
  });
};

const handleCancle = () => {
  dialogVisible.value = false;
  Object.assign(cachedData, {
    data: null
  });
};

const handleSubmit = (data: TableRow) => {
  console.log('handleSubmit data: ', data);
};


const temp = [] as string[];
const rowIndexList = [0, 1];

const spanMethod = ({ rowIndex, columnIndex, row, column }: { row: TableRow; column: any; rowIndex: number; columnIndex: number }) => {
  const mergedKey = `${rowIndex},${columnIndex}`;
  if (temp.includes(mergedKey)) {
    const index = temp.indexOf(mergedKey);
    temp.splice(index, 1)
    return {
      rowspan: 0,
      colspan: 0
    };
  }

  if (columnIndex !== 0 && rowIndexList.includes(rowIndex)) {
    if (!column.property) {
      return {
        rowspan: 1,
        colspan: 1
      };
    }
    const currentValue = row[column.property];
    const nextValue = tableData[rowIndex + 1]?.[column.property];
    if (currentValue === nextValue) {
      temp.push(`${rowIndex + 1},${columnIndex}`)
      return {
        rowspan: 2,
        colspan: 1
      };
    }
    return {
      rowspan: 1,
      colspan: 1
    };
  }
};
</script>

<template>
  <div>
    <div class="multi-header-table-view p-4">
      <el-table :data="tableData" style="width: 100%" border :span-method="spanMethod">
        <DynamicColumns :list="columnsList" :get-configs="getConfigs" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <CustomDialog title="基本员工信息" v-model="dialogVisible">
      <DetailsForm :data="cachedData.data" @cancel="handleCancle" @submit="handleSubmit" />
    </CustomDialog>
  </div>

</template>
