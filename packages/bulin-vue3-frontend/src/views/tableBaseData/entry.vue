<script setup>
import showDialog from '@/imperatives/showDialog.jsx';
import { Search } from '@element-plus/icons-vue';
import { fetchData } from '@i/index';
import { ElButton, ElMessage, ElMessageBox } from 'element-plus';
import { computed, h, reactive, ref } from 'vue';
import editForm from './editForm.vue';
import { tableColumnList, tableDataList } from './tableData.js';
import DynamicColumns from '@/components/dynamic-columns/DynamicColumns.vue';
import { cloneDeep } from 'lodash';
import { sortListByFeild } from '@libc/shared'
import { ElWatermark } from 'element-plus';

const query = reactive({
  address: '',
  name: '',
  pageIndex: 1,
  pageSize: 10,
});

const tableData = ref(cloneDeep(tableDataList))

const pageTotal = computed(() => tableDataList.length);
// 获取表格数据
function getData() {
  tableData.value = cloneDeep(tableDataList);
}

function selectionChange(rows) {
  console.log('selectionChange rows:', rows);
}

// 前端排序
function sortChange(props) {
  const { order, prop } = props;
  const copiedList = cloneDeep(tableDataList)
  tableData.value = sortListByFeild(copiedList, { field: prop, sort: order }, -1)

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
      const index = tableData.value.indexOf(row);
      ElMessage.success('删除成功');
      tableData.value.splice(index, 1);
    })
    .catch(() => { });
}


const svgToDataUri = (text) => {
  const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <text transform="rotate(-19 150 100) matrix(1 0 0 1 0 0)" opacity="0.15" xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_1" y="110.4" x="55.34375" stroke-width="0" stroke="#000" fill="#000000">${text}</text>
</svg>`
  const encoded = encodeURIComponent(defaultSvg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
  return `data:image/svg+xml,${encoded}`

}
</script>

<template>
  <div>
    <ElWatermark :width="300" :height="200" :image="svgToDataUri('张明楷 KaiZhang')">
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
        <el-table @sort-change="sortChange" :data="tableData" border stripe class="" :row-key="(row) => row.id"
          @filter-change="filterChange" @selection-change="selectionChange">
          <DynamicColumns :list="tableColumnList" />
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
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
            :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange" />
        </div>
      </div>
    </ElWatermark>
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
