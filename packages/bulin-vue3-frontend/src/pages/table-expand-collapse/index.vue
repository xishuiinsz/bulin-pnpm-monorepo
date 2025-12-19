<script setup lang="ts">
import pageData, { rootClass, tableList } from './page';
import FirstColumn from './FirstColumn.vue';
import { onMounted, reactive, ref } from 'vue';
import { Plus, Minus } from '@element-plus/icons-vue';
import { getSpanOptions } from '@libc/shared';

defineOptions({
  name: 'TableExpandCollapsePage'
});

interface User {
  id: number;
  surname: string;
  slogan: string;
  address: string;
  childrenList?: User[];
  level?: number;
}
interface SpanMethodProps {
  rowIndex: number;
  columnIndex: number;
}

const tableData = reactive<User[]>(structuredClone(tableList));

const childrenField = 'childrenList';

const expandedRowKeys = reactive<number[]>([]);

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
  const nameList = tableData.map((item: User) => item.slogan);
  const spanOptions = getSpanOptions(nameList);
  if (!Object.keys(spanOptions).length) {
    return [1, 1];
  }
  if (columnIndex === 0) {
    if (spanOptions[rowIndex]) {
      return [spanOptions[rowIndex], 1];
    }
    return [0, 1];
  }
  return [1, 1];
};

// 展开 动作
const handleExpand = (row: User) => {
  if (!row.childrenList?.length) {
    return;
  }
  const { id } = row;
  if (!expandedRowKeys.includes(id)) {
    expandedRowKeys.push(id);
  }
  const index = tableData.findIndex((item: User) => item.id === row.id);
  const currentLevel = row.level || 1;
  row.childrenList = row.childrenList.map((item) => ({
    ...item,
    level: currentLevel + 1
  }));

  tableData.splice(index + 1, 0, ...row.childrenList);
};

// 收起 动作
const handleCollapse = (row: User) => {
  if (!row.childrenList?.length) {
    return;
  }
  const { id } = row;
  if (expandedRowKeys.includes(id)) {
    expandedRowKeys.splice(expandedRowKeys.indexOf(id), 1);
  }
  const flatData = flatMapAll(row.childrenList || []);
  const ids = flatData.map((item) => item.id).map(String);

  for (let index = tableData.length - 1; index >= 0; index--) {
    const element = tableData[index];
    if (ids.includes(String(element.id))) {
      tableData.splice(index, 1);
      if (element.childrenList?.length) {
        expandedRowKeys.splice(expandedRowKeys.indexOf(element.id), 1);
      }
    }
  }
};

const handleEdit = (row: User) => {
  console.log('handleEdit row: ', row);
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
        <el-table :span-method="spanMethod" class="expand-collapse-table mt-4" :data="tableData" style="width: 100%"
          row-key="id" border>
          <el-table-column prop="slogan" align="center" label="标语" width="60" :key="tableData.length">
            <template #default="{ row }">
              <FirstColumn :data="row" />
            </template>
          </el-table-column>
          <el-table-column prop="surname" label="姓氏">
            <template #default="scope">
              <div class="d-flex align-items-center" :class="scope.row.level ? `level-${scope.row.level}` : 'level-1'">
                <template v-if="scope.row.childrenList?.length">
                  <el-icon class="icon-size-16 cursor-pointer me-2">
                    <template v-if="expandedRowKeys.includes(scope.row.id)">
                      <Minus @click="handleCollapse(scope.row)" />
                    </template>
                    <template v-else>
                      <Plus @click="handleExpand(scope.row)" />
                    </template>
                  </el-icon>
                </template>
                <span class="">{{ scope.row.surname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="Address" />
          <el-table-column  label="操作" >
            <template #default="{ row }">
              <el-link  @click="handleEdit(row)" type="primary" :underline="false">编辑</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-expand-collapse {
  .expand-collapse-table {
    .level-2 {
      padding-left: 20px;
    }

    .level-3 {
      padding-left: 40px;
    }

    .level-4 {
      padding-left: 48px;
    }
  }
}
</style>
