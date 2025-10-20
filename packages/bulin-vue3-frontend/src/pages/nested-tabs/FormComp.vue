<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, resolveComponent } from 'vue';
import AprComp from './components/AprComp.vue';
import FebComp from './components/FebComp.vue';
import JanComp from './components/JanComp.vue';
import JunComp from './components/JunComp.vue';
import MarComp from './components/MarComp.vue';
import MayComp from './components/MayComp.vue';
import { dataScope } from './page';

interface RuleForm {
  name: string;
  region: string;
  count: string;
  date1: string;
  date2: string;
  delivery: boolean;
  location: string;
  type: string[];
  resource: string;
  desc: string;
}

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  location: '',
  type: [],
  resource: '',
  desc: '',
});

const locationOptions = ['Home', 'Company', 'School'];

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change',
    },
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change',
    },
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change',
    },
  ],
  location: [
    {
      required: true,
      message: 'Please select a location',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
      trigger: 'change',
    },
  ],
  desc: [
    { required: true, message: 'Please input activity form', trigger: 'blur' },
  ],
});

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!');
    }
    else {
      console.log('error submit!', fields);
    }
  });
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  formEl.resetFields();
}

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}));

function getComponentByKey(key) {
  const mapComp = {
    Jan: JanComp,
    Feb: FebComp,
    Mar: MarComp,
    Apr: AprComp,
    May: MayComp,
    Jun: JunComp,

  };
  return mapComp[key] ?? JanComp;
}
</script>

<template>
  <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
    <el-form-item label="Activity name" prop="name">
      <el-input v-model="ruleForm.name" />
    </el-form-item>
    <el-form-item label="Activity zone" prop="region">
      <el-select v-model="ruleForm.region" placeholder="Activity zone">
        <el-option label="Zone one" value="shanghai" />
        <el-option label="Zone two" value="beijing" />
      </el-select>
    </el-form-item>
    <el-form-item label="Activity count" prop="count">
      <el-select-v2 v-model="ruleForm.count" placeholder="Activity count" :options="options" />
    </el-form-item>
    <el-form-item label="Activity time" required>
      <el-col :span="11">
        <el-form-item prop="date1">
          <el-date-picker
            v-model="ruleForm.date1" type="date" aria-label="Pick a date"
            placeholder="Pick a date" style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col class="text-center" :span="2">
        <span class="text-gray-500">-</span>
      </el-col>
      <el-col :span="11">
        <el-form-item prop="date2">
          <el-time-picker
            v-model="ruleForm.date2" aria-label="Pick a time" placeholder="Pick a time"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-form-item>
    <el-form-item :label="dataScope.label" :prop="dataScope.key">
      <div>
        <el-tabs stretch type="border-card" class="demo-tabs">
          <el-tab-pane v-for="item in dataScope.children" :key="item.key">
            <template #label>
              <span class="custom-tabs-label">
                <el-checkbox v-model="item.isChecked" class=" me-2" />
                <span>{{ item.label }}</span>
              </span>
            </template>
            <div>
              <el-tabs type="border-card" class="demo-tabs">
                <el-tab-pane v-for="subItem in item.children" :key="subItem.key">
                  <template #label>
                    <span class="custom-tabs-label">
                      <el-checkbox v-model="subItem.isChecked" :disabled="!item.isChecked" class=" me-1" />
                      <span>{{ subItem.label }}</span>
                    </span>
                  </template>
                  <div>
                    <component v-bind="subItem" :is="getComponentByKey(subItem.key)" />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-form-item>
  </el-form>
</template>
