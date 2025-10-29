<script setup>
import CustomColumns from '@/components/structuredTable/CustomColumns.vue';
import showDialog from '@/imperatives/showDialog.jsx';
import { Search } from '@element-plus/icons-vue';
import { fetchData } from '@i/index';
import { ElButton, ElMessage, ElMessageBox } from 'element-plus';
import { computed, h, reactive, ref } from 'vue';
import editForm from './editForm.vue';
import { tableColumnList, tableDataList } from './tableData.js';

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
    tableDataList.value = res.list || [];
    pageTotal.value = res.pageTotal || 50;
  });
}

function selectionChange(rows) {
  console.log('selectionChange rows:', rows);
}
function filterChange(data) {
  console.log('filterChange data:', data);
}

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

// 操作列之“编辑”点击事件
function handleEdit(row) {
  let dialogInstance = null;
  const closeEvt = () => {
    dialogInstance?.destroy?.();
  };
  const submitEvt = (formData) => {
    Object.assign(row, formData);
    ElMessage.success('编辑成功');
  };
  const params = {
    title: '编辑',
    slots: {
      default: () => h(editForm, { close: closeEvt, initialFormData: { ...row }, onSubmit: submitEvt }),
    },
  };
  dialogInstance = showDialog(params);
}

// 删除操作
function handleDelete(row) {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      const index = tableDataList.findIndex(item => item === row);
      ElMessage.success('删除成功');
      tableDataList.splice(index, 1);
    })
    .catch(() => { });
}
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
        <el-input v-model="query.name" placeholder="用户名" class="handle-input mr10"
          @input="queryByName('test', 'test1')" />
        <ElButton type="primary" :icon="Search" @click="handleSearch">
          搜索
        </ElButton>
      </div>
      <el-table :data="tableDataList" border stripe class="" :row-key="(row) => row.id" @filter-change="filterChange"
        @selection-change="selectionChange">
        <CustomColumns :list="tableColumnList">
          <template #suffix>
            <el-table-column label="操作" width="120" :sortable="false" :resizable="false">
              <template #default="{ row }">
                <ElButton :link="true" type="primary" @click="handleEdit(row)">
                  编辑
                </ElButton>
                <ElButton :link="true" type="danger" @click="handleDelete(row)">
                  删除
                </ElButton>
              </template>
            </el-table-column>
          </template>
        </CustomColumns>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
          :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange" />
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
  width: 140px;
  object-fit: cover;
}
</style>
