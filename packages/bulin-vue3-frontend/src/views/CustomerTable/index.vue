<script setup name="CustomerTable">
import showDialog from '@/imperatives/showDialog';
import { deleteCustomerData, fetchCustomerData, updateCustomerData } from '@i';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import { h, onMounted, reactive, readonly, ref, toRaw } from 'vue';
import editCustomer from './editCustomer.vue';

defineOptions({
  name: 'CustomerTable',
});

const queryInit = {
  address: '',
  name: '',
  pageIndex: 1,
  pageSize: 10,
};

const rowData = reactive({});

const query = reactive({ ...queryInit });
const tableData = ref([]);
const pageTotal = ref(0);
// 获取表格数据
function getData() {
  fetchCustomerData(query).then((res) => {
    tableData.value = res?.list || [];
    pageTotal.value = res?.pageTotal ?? 0;
  });
}

// 重置操作
function handleReset() {
  Object.assign(query, {
    ...queryInit,
  });
  handleSearch();
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

// 删除操作
function handleDelete(row) {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',
  })
    .then(async (status) => {
      if (status === 'confirm') {
        const loadingInstance = ElLoading.service();
        const resp = await deleteCustomerData({
          customerId: row.customerId,
        });
        loadingInstance.close();
        if (resp && resp.code === '0') {
          ElMessage.success(resp.msg || '删除成功');
          handleSearch();
        }
        else {
          ElMessage.error(resp.msg || '删除失败');
        }
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
}

// 表格编辑时弹窗和保存
const form = reactive({
  name: '',
  address: '',
});
let editCustomerInstance;
// 点击[编辑]事件
function handleEdit(row) {
  const submit = (data) => {
    saveEdit(data);
  };
  const cancel = () => {
    editCustomerInstance?.destroy?.();
  };
  editCustomerInstance = showDialog({
    title: '编辑',
    width: '30%',
    slots: {
      default: () => h(editCustomer, { formInit: toRaw(row), cancel, submit }),
    },
  });
}
// 编辑提交事件
async function saveEdit(data) {
  const parmas = { ...data };
  const [firstName, lastName] = parmas.fullName.split(' ');
  Object.assign(parmas, {
    firstName,
    lastName,
  });
  const loadingInstance = ElLoading.service();
  const resp = await updateCustomerData(readonly(parmas));
  loadingInstance.close();
  if (resp && resp.code === '0') {
    editCustomerInstance?.destroy?.();
    ElMessage.success((resp && resp.msg) || '操作成功');
    handleSearch();
  }
  else {
    ElMessage.error((resp && resp.msg) || '操作失败');
  }
}

const map = new Map();

const buttonRef = ref();
const popoverRef = ref();

function mouseenterEvt(data) {
  Object.assign(rowData, { ...data });
  const el = map.get(data);
  buttonRef.value = el;
}

function closePopover(instance) {
  instance.hide();
}
onMounted(getData);
</script>

<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades" />
          客户表格
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-form :inline="true">
          <el-form-item label="用户名">
            <el-input v-model="query.name" placeholder="请输入用户名" class="handle-input mr10" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="query.address" placeholder="请输入地址" class="handle-input mr10" />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" icon="el-icon-search" @click="handleReset">
                重置
              </el-button>
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">
                搜索
              </el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="el-table-container">
        <el-table ref="customerTable" table-layout="auto" :data="tableData" border class="table"
          header-cell-class-name="table-header">
          <el-table-column prop="customerId" label="客户编号" label-class-name="label-nowrap" align="center" />
          <el-table-column prop="fullName" label="客户代表">
            <template #default="{ row }">
              <div @mouseenter.stop="mouseenterEvt(row)">
                <div :ref="el => map.set(row, el)">
                  {{ row.firstName }} {{ row.lastName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="company" label-class-name="label-nowrap" label="客户公司" />
          <el-table-column prop="address" label="客户地址" />
          <el-table-column prop="city" label="城市" />
          <el-table-column prop="state" label-class-name="label-nowrap" label="省|州" />
          <el-table-column prop="country" label="国家" />
          <el-table-column prop="email" label="邮件" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <div class="d-flex">
                <el-button :text="true" @click="handleEdit(scope.row)">
                  编辑
                </el-button>
                <span>
                  <el-button :text="true" class="red" @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </span>

              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
          :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange" />
      </div>
    </div>
    <el-popover ref="popoverRef" :virtual-ref="buttonRef" placement="right" trigger="hover" virtual-triggering>
      <div>
        <el-button @click="closePopover(popoverRef)">
          关闭
        </el-button>
        <span> {{ rowData.company }} </span>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
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

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
