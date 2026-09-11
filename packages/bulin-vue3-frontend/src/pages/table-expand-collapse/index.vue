<script setup lang="ts">
import pageData, { rootClass, tableList } from './page';
import FirstColumn from './FirstColumn.vue';
import { h, reactive, ref } from 'vue';
import { Plus, Minus } from '@element-plus/icons-vue';
import { getSpanOptions } from '@libc/shared';
import showDialog from '@/imperatives/showDialog';
import DetailsForm from './DetailsForm.vue';

defineOptions({
  name: 'TableExpandCollapsePage'
});

export interface User {
  id: string;
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

const expandedRowKeys = reactive<User['id'][]>([]);

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

const getRowKey = (row: User) => {
  if (row.id) {
    return row.id;
  }
  return row.slogan + row.surname
}

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
  // 统一用 getRowKey 作为唯一标识（兼容没有 id 的行），避免直接用 row.id 匹配失败
  const rowKey = getRowKey(row);
  // 已展开则直接返回：保证函数幂等，重复点击 / 重复调用都不会重复插入子行
  if (expandedRowKeys.includes(rowKey)) {
    return;
  }
  const index = tableData.findIndex((item: User) => getRowKey(item) === rowKey);
  // 定位不到当前行（例如传入的是不在表格里的数据）时，不修改任何状态
  if (index < 0) {
    return;
  }
  const currentLevel = row.level || 1;
  // 就地写入 level，避免每次展开都重建 childrenList 对象（行对象身份保持稳定）
  row.childrenList.forEach((item) => {
    item.level = currentLevel + 1;
  });
  expandedRowKeys.push(rowKey);

  tableData.splice(index + 1, 0, ...row.childrenList);
};

// 收起 动作
const handleCollapse = (row: User) => {
  if (!row.childrenList?.length) {
    return;
  }
  const rowKey = getRowKey(row);
  const selfKeyIndex = expandedRowKeys.indexOf(rowKey);
  if (selfKeyIndex > -1) {
    expandedRowKeys.splice(selfKeyIndex, 1);
  }
  // 递归收集整棵子树的 key（flatMapAll 会把所有子孙平铺出来）
  const descendantKeys = flatMapAll(row.childrenList || []).map((item) => getRowKey(item));

  for (let index = tableData.length - 1; index >= 0; index--) {
    const element = tableData[index] as User;
    const elementKey = getRowKey(element);
    if (!descendantKeys.includes(elementKey)) {
      continue;
    }
    tableData.splice(index, 1);
    // 先判断 indexOf > -1 再删除：否则 indexOf 返回 -1 时 splice(-1, 1)
    // 会误删 expandedRowKeys 的最后一个元素（其它已展开节点的 key）
    const keyIndex = expandedRowKeys.indexOf(elementKey);
    if (keyIndex > -1) {
      expandedRowKeys.splice(keyIndex, 1);
    }
  }
};

const updateTableList = (list: User[], rowData: User) => {
  const _list: User[] = structuredClone(list)
  const tempFunc = (data: User[]) => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index] as User;
      if (getRowKey(element) === getRowKey(rowData)) {
        Object.assign(element, rowData);
        break;
      } else if (element.childrenList?.length) {
        tempFunc(element.childrenList)
      }
    }
  }
  tempFunc(_list)
  return _list
}

function getExpandedRows(
  treeData: User[],
  expandedKeys: string[]
): User[] {
  const expandedSet = new Set(expandedKeys);
  const res: User[] = [];

  function dfs(node: User, depth: number, shouldShow: boolean) {
    if (shouldShow) {
      res.push({ ...node, level: depth }); // depth 此时从 1 开始
    }
    const childrenShouldShow = shouldShow && expandedSet.has(getRowKey(node));
    if (node.childrenList) {
      node.childrenList.forEach(child =>
        dfs(child, depth + 1, childrenShouldShow)
      );
    }
  }

  // 根节点层级设为 1
  treeData.forEach(root => dfs(root, 1, true));
  return res;
}

const handleEdit = (row: User) => {
  let editCustomerInstance: { destroy: () => void };
  const submit = (data: User) => {
    const copiedTablelist = updateTableList(tableList, data);
    const expandedTableList = getExpandedRows(copiedTablelist, expandedRowKeys)
    tableData.length = 0;
    tableData.push(...expandedTableList);
    editCustomerInstance?.destroy?.();
  };
  const cancel = () => {
    editCustomerInstance?.destroy?.();
  };
  const { childrenList, ...restData } = row;
  editCustomerInstance = showDialog({
    title: '编辑',
    width: '30%',
    slots: {
      default: () => h(DetailsForm, { data: { ...restData }, cancel, submit })
    }
  });
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
          :row-key="getRowKey" border>
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
                    <template v-if="expandedRowKeys.includes(getRowKey(scope.row))">
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
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-link @click="handleEdit(row)" type="primary" :underline="false">编辑</el-link>
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
