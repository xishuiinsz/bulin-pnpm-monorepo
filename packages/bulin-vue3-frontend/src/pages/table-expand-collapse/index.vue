<script setup lang="ts">
import pageData, { rootClass, tableData } from './page';
import { Plus, Minus, Setting } from '@element-plus/icons-vue';
import { cloneDeep } from 'lodash';
import FirstColumn from './FirstColumn.vue';

defineOptions({
  name: 'TableExpandCollapsePage'
});

interface User {
  id: number;
  date: string;
  name: string;
  address: string;
  childrenList?: User[];
  level?: number;
}
interface SpanMethodProps {
  rowIndex: number;
  columnIndex: number;
}

const flatMapAll = (list: User[], data: User[] = []) => {
  list.forEach((item) => {
    const { childrenList, ...rest } = item;
    data.push({ ...rest });
    if (childrenList?.length) {
      flatMapAll(childrenList, data);
    }
  });
  return data;
};

const spanMethod = ({ rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return [tableData.length, 1];
    }
    return [0, 0];
  }
  return [1, 1];
};

const handleExpand = (row: User) => {
  const index = tableData.findIndex((item: User) => item.id === row.id);
  if (row.childrenList?.length) {
    const children = cloneDeep(row.childrenList);
    children.forEach((item: User) => {
      Object.assign(item, { level: row.level ? row.level + 1 : 1 });
    });
    tableData.splice(index + 1, 0, ...children);
  }
};

const handleCollapse = (row: User) => {
  const subData = flatMapAll(row.childrenList || []);
  const ids = subData.map((item) => item.id);
  for (let index = tableData.length - 1; index >= 0; index--) {
    const element = tableData[index];
    if (ids.includes(element.id)) {
      tableData.splice(index, 1);
    }
  }
};
</script>

<template>
  <div :class="rootClass" class="w-100 h-100 d-flex flex-column">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          {{ pageData.title }}
        </span>
      </div>
    </div>
    <div class="container w-100 h-100 flex-fill">
      <h4>{{ JSON.stringify(pageData, null, 4) }}</h4>
      <div>
        <el-table :span-method="spanMethod" class=" mt-4" :data="tableData" style="width: 100%" row-key="id" border>
          <el-table-column prop="name" align="center" label="标语" width="60" :key="tableData.length" >
            <template #default="{row}">
              <FirstColumn :data="row" />
            </template>
          </el-table-column>
          <el-table-column prop="date" label="Date" sortable>
            <template #default="scope">
              <div class="d-flex align-items-center" :class="`ps-${scope.row.level *2}`">
                <el-icon v-if="scope.row.childrenList?.length" class="icon-size-16 cursor-pointer">
                  <Plus @click="handleExpand(scope.row)"
                    v-if="scope.row.childrenList?.[0]?.id !== tableData[scope.$index + 1]?.id" />
                  <Minus @click="handleCollapse(scope.row)" v-else />
                </el-icon>
                <span class=" ms-2">{{ scope.row.date }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="Address" sortable />
        </el-table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.css-container-queries {}
</style>
