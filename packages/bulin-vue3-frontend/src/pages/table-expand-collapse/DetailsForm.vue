<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import type { User } from './index.vue';

const { data, cancel, submit } = defineProps<{ data: User, cancel: () => void; submit: (p: User) => void }>();
const emit = defineEmits(['cancle', 'submit']);
const formData = reactive({ ...data });
const formRef = ref();
const rules = {
    surname: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
    ],
    address: [
        { required: true, message: '请输入地址', trigger: 'blur' },
    ],
}
const handleCancle = () => {
    typeof cancel === 'function' && cancel();
};
const handleSubmit = async () => {
    try {
        await formRef.value.validate();
    } catch (error) {
        console.log('校验不通过: ', error);
    }
    typeof submit === 'function' && submit({ ...formData });
};
</script>
<template>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="口号：">
            <el-input disabled v-model="formData.slogan" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="姓氏：" prop="surname">
            <el-input v-model="formData.surname" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="地址：" prop="address">
            <el-input v-model="formData.address" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item>
            <div class="text-end w-100"> <el-button @click="handleCancle">取消</el-button>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
            </div>
        </el-form-item>
    </el-form>
</template>