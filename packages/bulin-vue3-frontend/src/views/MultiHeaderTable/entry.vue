<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { sortListByFeild } from '@libc/shared';
import DynamicColumns from '@/components/dynamic-columns/DynamicColumns.vue';
import CustomDialog from '@c/CustomDialog.vue';
import DetailsForm from './DetailsForm.vue';
import { columns, tableData } from './utils';

defineOptions({
  name: 'MultiHeaderTableView'
});

/** 表格行数据，字段结构与 ./utils 的 tableData 保持一致 */
type TableRow = (typeof tableData)[number];
/** el-table 的 span-method 约定的返回值 */
type CellSpan = { rowspan: number; colspan: number };
/** el-table 的 sort-change 事件参数 */
type SortChangeParams = { prop?: string; order?: 'ascending' | 'descending' | null };

/** 正常渲染的单元格 */
const SINGLE_SPAN: CellSpan = { rowspan: 1, colspan: 1 };
/** 被上方同值单元格合并掉、不再渲染的单元格 */
const MERGED_SPAN: CellSpan = { rowspan: 0, colspan: 0 };

const sourceRows = structuredClone(tableData);
// 表格数据用本地副本：编辑回写不会污染 ./utils 中被多处共享的静态数据
const rows = ref<TableRow[]>(sourceRows);
// 初始行序（与 rows 共用同一批行对象）：取消排序时按它恢复，且不会丢掉已编辑的内容
const initialRows = [...sourceRows];

/** 列配置节点（多级表头的子列与之递归同构） */
type ColumnNode = { prop?: string; children?: ColumnNode[] };

// 列的个性化配置，按列 prop 覆盖
const columnConfigMap: Record<string, Record<string, unknown>> = {
  // 姓名列内容偏长，加宽避免换行
  name: { width: 200 },
  // 合并单元格依赖行序，排序改为自行处理，保证 rows 与表格展示顺序始终一致
  age: { sortable: 'custom' }
};

/** 递归把 columnConfigMap 合入列配置树（含多级表头的子列） */
function applyColumnConfig<T extends ColumnNode>(list: T[]): T[] {
  return list.map((column) => {
    if (column.children?.length) {
      return { ...column, children: applyColumnConfig(column.children) } as T;
    }
    const override = column.prop ? columnConfigMap[column.prop] : undefined;
    return (override ? { ...column, ...override } : column) as T;
  });
}

// 列配置是静态数据，初始化时合入一次个性化配置即可，无需 reactive 做深层代理；
// DynamicColumns 只接收最终的 list（与【基础表格】页的用法一致）
const columnsList = applyColumnConfig(columns);

/** 取出列配置树中的叶子列 prop，即真正承载数据的列（“操作”列没有 prop，不在其中） */
function collectDataProps(list: ColumnNode[]): string[] {
  return list.flatMap((column) => {
    if (column.children?.length) {
      return collectDataProps(column.children);
    }
    return column.prop ? [column.prop] : [];
  });
}

const dataProps = collectDataProps(columnsList);

/** span-method 拿到的 column.property 是运行时字符串，这里按它动态取值 */
const readCell = (row: TableRow, prop: string): unknown => (row as Record<string, unknown>)[prop];

/**
 * 预计算“相邻同值单元格”的纵向合并表，key 为 `${rowIndex},${prop}`：
 * - 同值区间的首行：rowspan = 区间长度（连续 3 行及以上同样适用）
 * - 区间内的其余行：rowspan/colspan = 0，即被合并、不渲染
 * 一次性算完再查表（O(1)）：不依赖 el-table 的渲染顺序，重复渲染也不会残留脏状态，
 * 无需再在 span-method 里读写模块级临时数组。
 */
const spanMap = computed(() => {
  const list = rows.value;
  const map = new Map<string, CellSpan>();
  const valueAt = (rowIndex: number, prop: string) => {
    const row = list[rowIndex];
    return row ? readCell(row, prop) : undefined;
  };

  dataProps.forEach((prop) => {
    let rowIndex = 0;
    while (rowIndex < list.length) {
      const value = valueAt(rowIndex, prop);
      let rowspan = 1;
      // 空值不参与合并，避免多个空白单元格被并成一个大空格
      if (value !== undefined && value !== null && value !== '') {
        while (rowIndex + rowspan < list.length && valueAt(rowIndex + rowspan, prop) === value) {
          rowspan += 1;
        }
      }
      if (rowspan > 1) {
        map.set(`${rowIndex},${prop}`, { rowspan, colspan: 1 });
        for (let offset = 1; offset < rowspan; offset += 1) {
          map.set(`${rowIndex + offset},${prop}`, MERGED_SPAN);
        }
      }
      rowIndex += rowspan;
    }
  });

  return map;
});

const spanMethod = ({ column, rowIndex }: { column?: { property?: string }; rowIndex: number }): CellSpan => {
  const prop = column?.property;
  // “操作”列等没有 property 的列不参与合并
  if (!prop || !dataProps.includes(prop)) {
    return SINGLE_SPAN;
  }
  return spanMap.value.get(`${rowIndex},${prop}`) ?? SINGLE_SPAN;
};

// 年龄列排序（已声明 sortable: 'custom'）：order 为 null 表示取消排序，恢复初始行序
function handleSortChange({ prop, order }: SortChangeParams) {
  if (!prop || !order) {
    rows.value = [...initialRows];
    return;
  }
  rows.value = sortListByFeild([...rows.value], { field: prop as keyof TableRow, sort: order });
}

const dialogVisible = ref(false);
// 当前编辑的行：CustomDialog 关闭即销毁（destroyOnClose），下次打开会用新的行重新初始化表单
const editingRow = ref<TableRow | null>(null);

function handleEdit(row: TableRow) {
  editingRow.value = row;
  dialogVisible.value = true;
}

function handleCancel() {
  dialogVisible.value = false;
  editingRow.value = null;
}

// 保存：回写当前行并关闭弹窗（与 tableBaseData 的编辑约定保持一致）
function handleSubmit(data: Partial<TableRow>) {
  if (!editingRow.value) {
    return;
  }
  Object.assign(editingRow.value, data);
  ElMessage.success('编辑成功');
  handleCancel();
}
</script>

<template>
  <div class="multi-header-table-view p-4">
    <el-table :data="rows" style="width: 100%" border :span-method="spanMethod" @sort-change="handleSortChange">
      <DynamicColumns :list="columnsList" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <CustomDialog v-model="dialogVisible" title="基本员工信息">
      <DetailsForm v-if="editingRow" :data="editingRow" @cancel="handleCancel" @submit="handleSubmit" />
    </CustomDialog>
  </div>
</template>
