<script setup lang="ts">
import { Plus, Minus } from "@element-plus/icons-vue";

interface Props {
  row: Record<string, any>;
  column: Record<string, any>;
  expandedRowKeys: string[];
  childKey: string;
  getRowKey: (p: Record<string, string>) => string;
  handleExpand: (p: Record<string, any>) => void;
  handleCollapse: (p: Record<string, any>) => void;
}

const props = defineProps<Props>();
console.log('props: ', props);

</script>

<template>
  <div class="expand-collapse-rows d-flex align-items-center" :class="row.level ? `level-${row.level}` : 'level-1'">
    <template v-if="row[childKey]?.length">
      <el-icon class="icon-size-16 cursor-pointer me-2">
        <template v-if="expandedRowKeys.includes(getRowKey(row))">
          <Minus @click="handleCollapse(row)" />
        </template>
        <template v-else>
          <Plus @click="handleExpand(row)" />
        </template>
      </el-icon>
    </template>
    <span class="">{{ row[column.property] }}</span>
  </div>
</template>
