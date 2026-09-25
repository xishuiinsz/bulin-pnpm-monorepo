<script setup lang="ts">
import { ElTableColumn } from 'element-plus';
import { h, type VNode } from 'vue';
import { type ElTableColumnProps, type ElTableColumnSlots } from './utils';

const props = defineProps<{
  list: ElTableColumnProps[];
  /** 列的个性化配置：返回值会合并进该列的 props（多级表头的子列同样生效） */
  getConfig?: (column: ElTableColumnProps) => Partial<ElTableColumnProps> | undefined;
}>();

/**
 * 动态列组件：递归把列配置渲染成 el-table-column
 * - children：多级表头的子列，渲染为父列的默认插槽；
 * - slots：自定义单元格 / 表头插槽，原样透传给 el-table-column；
 * - 其余字段（含 getConfig 的覆盖项）：el-table-column 的 props。
 *
 * children / slots 必须由本组件消费掉，不能跟着 props 一起透传：
 * el-table-column 没有声明它们，透传就会以 attrs 的形式落到它 render 出来的根 div 上，
 * 而 div.children 是只读属性，Vue 给它赋值时会抛错并打印
 * [Vue warn]: Failed setting prop "children" on <div>: value [object Object],... is invalid.
 * TypeError: Cannot set property children of #<Element> which has only a getter
 */
const renderColumn = (column: ElTableColumnProps): VNode => {
  const { children, slots, ...columnProps } = { ...column, ...props.getConfig?.(column) };
  const columnSlots: ElTableColumnSlots = { ...slots };
  if (children?.length) {
    columnSlots.default = () => children.map((child: ElTableColumnProps) => renderColumn(child));
  }
  return h(ElTableColumn, columnProps, columnSlots);
};
</script>

<template>
  <!-- 直接输出 el-table-column 的 vnode，不再包一层组件；key 也能落到列本身（el-table-column 会用它做 rawColumnKey） -->
  <component :is="renderColumn(column)" v-for="column in props.list" :key="column.prop || column.label" />
</template>
