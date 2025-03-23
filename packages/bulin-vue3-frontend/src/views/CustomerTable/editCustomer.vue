<script setup>
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus';
import { reactive, toRaw } from 'vue';

const props = defineProps({
  formInit: {
    type: Object,
    default: () => { },
  },
  submit: {
    type: Function,
    default: () => { },
  },
  cancel: {
    type: Function,
    default: () => { },
  },
});
const form = reactive({
  ...props.formInit,
  fullName: `${props.formInit.firstName} ${props.formInit.lastName}`,
});
function submitClick() {
  typeof props.submit === 'function' && props.submit({ ...toRaw(form) });
}
function cancelClick() {
  typeof props.cancel === 'function' && props.cancel();
}
</script>

<template>
  <div class="edit-customer-form test-1742734748921">
    <ElForm label-width="100px">
      <ElFormItem prop="fullName" label="用户名">
        <ElInput v-model="form.fullName" />
      </ElFormItem>
      <ElFormItem label="客户公司名">
        <ElInput v-model="form.company" />
      </ElFormItem>
      <ElFormItem label="客户地址">
        <ElInput v-model="form.address" />
      </ElFormItem>
      <ElFormItem label="城市">
        <ElInput v-model="form.city" />
      </ElFormItem>
      <ElFormItem label="省|州">
        <ElInput v-model="form.state" />
      </ElFormItem>
      <ElFormItem label="国家">
        <ElInput v-model="form.country" />
      </ElFormItem>
      <ElFormItem label="邮件">
        <ElInput v-model="form.email" />
      </ElFormItem>
    </ElForm>
    <div class="dialog-footer text-center">
      <ElButton @click="cancelClick">
        取 消
      </ElButton>
      <ElButton type="primary" @click="submitClick">
        确 定
      </ElButton>
    </div>
  </div>
</template>
