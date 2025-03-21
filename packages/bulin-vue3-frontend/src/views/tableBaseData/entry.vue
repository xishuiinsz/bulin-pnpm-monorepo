<script setup>
import { myDebounced } from '@/utils';
import structuredTable from '@c/structuredTable/entry.jsx';
import { Search } from '@element-plus/icons-vue';
import { fetchData } from '@i/index';
import { ElButton } from 'element-plus';
import { computed, h, reactive, ref } from 'vue';
import { tableColumnList, tableDataList, tableOptions } from './tableData.js';

const query = reactive({
  address: '',
  name: '',
  pageIndex: 1,
  pageSize: 10,
});
const pageTotal = computed(() => tableDataList.length);
// 获取表格数据
function getData() {
  fetchData(query).then((res) => {
    tableDataList.value = res.list;
    pageTotal.value = res.pageTotal || 50;
  });
}
// getData()

// 查询操作
function handleSearch() {
  query.pageIndex = 1;
  getData();
}
// 分页导航
function handlePageChange(val) {
  query.pageIndex = val;
  getData();
}

// 表格编辑时弹窗和保存
const editVisible = ref(false);
const form = reactive({
  id: '',
  name: '',
  address: '',
});
function saveEdit() {
  editVisible.value = false;
  const { id } = form;
  const [editRow] = tableDataList.filter(item => item.id === id);
  editRow && Object.assign(editRow, form);
}
</script>

<script>
export default {
  name: 'BasetableDemo',
};
</script>

<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades" />
          基础表格
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-select v-model="query.address" placeholder="地址" class="handle-select mr10">
          <el-option key="1" label="广东省" value="广东省" />
          <el-option key="2" label="湖南省" value="湖南省" />
        </el-select>
        <el-input
          v-model="query.name"
          placeholder="用户名"
          class="handle-input mr10"
          @input="queryByName('test', 'test1')"
        />
        <ElButton type="primary" :icon="Search" @click="handleSearch">
          搜索
        </ElButton>
      </div>
      <structuredTable class="my-table" :table-column-list="tableColumnList" :table-options="tableOptions" />
      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="query.pageIndex"
          :page-size="query.pageSize"
          :total="pageTotal"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
  display: inline-block;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #ff0000;
}

.mr10 {
  margin-right: 10px;
}

:deep(.table-td-thumb) {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
