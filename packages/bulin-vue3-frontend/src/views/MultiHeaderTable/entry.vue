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
// 登记已被上方行合并掉的单元格坐标（`${rowIndex},${columnIndex}`），渲染到该坐标时不再输出单元格
const temp = [] as string[]
const spanMethod = ({ rowIndex, columnIndex, row, column }: { row: TableRow; column: any; rowIndex: number; columnIndex: number }) => {
  const mergedKey = `${rowIndex},${columnIndex}`;
  // 已被合并掉的单元格：本行不再渲染，并消费掉该登记项
  // 注意：此判断必须独立于下方的 rowIndex === 0，否则第 2 行永远走不到，单元格不会被隐藏
  if (temp.includes(mergedKey)) {
    const index = temp.indexOf(mergedKey);
    temp.splice(index, 1)
    return {
      rowspan: 0,
      colspan: 0
    };
  }
  // 仅第 1 行与第 2 行参与合并，其他行不处理上述逻辑
  if (columnIndex !== 0 && rowIndex === 0) {
    // “操作”列没有 prop，column.property 为 undefined，
    // 若不排除则 undefined === undefined 恒成立，会把操作列也误判为需要合并
    if (!column.property) {
      return {
        rowspan: 1,
        colspan: 1
      };
    }
    // 计算出当前列及下列对应的 单元格值
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
