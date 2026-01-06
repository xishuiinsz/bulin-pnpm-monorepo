import { ElTableColumn } from 'element-plus';
import { type ExtractPublicPropTypes } from 'vue';

export type ElTableColumnProps = ExtractPublicPropTypes<InstanceType<typeof ElTableColumn>> & {
  children?: ElTableColumnProps[];
};
