<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElForm } from 'element-plus';

const { data = {} } = defineProps<{ data: any }>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

// 表单数据
const formData = reactive({
  name: data.name || '',
  age: data.age || '',
  department: data.department || '',
  position: data.position || '',
  phone: data.phone || '',
  email: data.email || ''
});

const deptList = [{ value: '研发部', label: '研发部' }, { value: '行政部', label: '行政部' }, { value: '产品部', label: '产品部' }, { value: '技术部', label: '技术部' }]

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 18, max: 65, message: '年龄必须在 18 到 65 岁之间', trigger: 'blur' }
  ],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' },
    { min: 2, max: 20, message: '职位长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
});

const handleCancel = () => {
  emit('cancel');
};

const handleSubmit = () => {
  emit('submit', { ...formData });
};
</script>

<template>
  <div>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" label-position="left">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" clearable />
      </el-form-item>

      <el-form-item label="年龄" prop="age">
        <el-input-number :controls="false" v-model="formData.age" :min="18" :max="65" align="left"
          style="width: 100%" />
      </el-form-item>

      <el-form-item label="部门" prop="department">
        <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%" clearable>
          <el-option v-for="dept in deptList" :key="dept.value" :label="dept.label" :value="dept.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="职位" prop="position">
        <el-input v-model="formData.position" placeholder="请输入职位" clearable />
      </el-form-item>

      <el-form-item label="电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号码" clearable maxlength="11" show-word-limit />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱地址" clearable type="email" />
      </el-form-item>
    </el-form>
    <span class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </span>
  </div>
</template>