import { ElTableColumn } from 'element-plus';
import { type ExtractPublicPropTypes } from 'vue';

/** el-table-column 插槽的作用域，default（单元格）与 header（表头）的参数结构一致 */
export interface ElTableColumnSlotScope {
  row: Record<string, any>;
  column: Record<string, any>;
  $index: number;
}

/** 列配置里的自定义插槽，如 { default: ({ row }) => h('span', row.name) } */
export type ElTableColumnSlots = Record<string, (scope: ElTableColumnSlotScope) => unknown>;

export type ElTableColumnProps = ExtractPublicPropTypes<InstanceType<typeof ElTableColumn>> & {
  /** 多级表头的子列配置，渲染为父列的默认插槽 */
  children?: ElTableColumnProps[];
  /** 透传给 el-table-column 的插槽（单元格、表头等） */
  slots?: ElTableColumnSlots;
};
