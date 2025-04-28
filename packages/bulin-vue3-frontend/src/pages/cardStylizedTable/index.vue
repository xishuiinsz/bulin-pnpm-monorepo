<script setup>
import { computed, ref, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { tableData } from './data';
import RowSort from './RowSort.vue';
import { cellNumberFormat, getDecimalPart } from '@/utils/index';
import { ElTooltip } from 'element-plus';

const route = useRoute();
const router = useRouter();
function handleClick(data) { }
const currentPage = ref(1);

const pageSize = ref(10);

const maxHeight = computed(() => {
  const pageHeaderHeight = '70px';
  return 900;
});

const sortFlag = ref(false);

const computedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = currentPage.value * pageSize.value;
  return tableData.slice(start, end);
});

const depositFormatter = (row, column, cellValue) => {
  const value = cellNumberFormat(cellValue);
  const decimalPart = getDecimalPart(value);
  if (!decimalPart) {
    return value;
  }
  return h(ElTooltip, { effect: 'dark', content: cellValue, placement: 'top' }, () => value);
};
</script>

<template>
  <div class="card-style-table-container w-100 h-100 d-flex flex-column">
    <div class="crumbs d-flex align-items-center">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          卡片化表格
        </span>
      </div>
      <el-switch v-model="sortFlag" class="ms-3" active-text="启用序号列拖拽" inactive-text="禁用序号列拖拽" />
    </div>
    <div class="container table-container w-100 h-100 flex-fill">
      <el-table class="card-style-table" row-key="id" :data="computedTableData" :max-height="maxHeight"
        style="width: 100%">
        <template v-if="sortFlag">
          <RowSort />
        </template>

        <el-table-column prop="date" label="Date" width="150" />
        <el-table-column prop="name" label="Name" width="150" />
        <el-table-column prop="state" label="State" width="150" />
        <el-table-column prop="city" label="City" width="150" />
        <el-table-column prop="address" width="150" label-class-name="label-nowrap" label="Address">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.address" placement="top">
              <div class="text-truncate">{{ scope.row.address }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="zip" label="Zip" width="150" />
        <el-table-column prop="deposit" label="存款" width="180" :formatter="depositFormatter" />
        <el-table-column label="Operations" min-width="120">
          <template #default>
            <el-button link type="primary" size="small" @click="handleClick">
              Detail
            </el-button>
            <el-button link type="primary" size="small">
              Edit
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" class="p-4 justify-content-end"
        background :page-sizes="[10, 20, 50, 100, 200, 300, 400]" layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length">
        条/页
      </el-pagination>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-style-table {
  .table-container:has(.el-table.el-table--scrollable-y) {
    .el-pagination {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
