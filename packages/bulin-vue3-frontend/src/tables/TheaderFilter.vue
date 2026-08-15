<script setup lang="ts">
import { Filter } from '@element-plus/icons-vue'
import type { ElPopover } from 'element-plus';
import { ref, computed } from 'vue';

interface Props {
    data: {
        column: {
            label: string;
        };
    };
    options: Array<Record<string, string>>;
    modelValue: string[];
    valueField?: string;
    labelField?: string;
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
}>();

const popover = ref<InstanceType<typeof ElPopover> | null>(null);

const { data, options, modelValue, valueField = 'value', labelField = 'label' } = defineProps<Props>();

const hasFilter = computed(() => {
    return modelValue.length > 0;
});
const selected = ref<string[]>([...modelValue]);
const searchKey = ref<string>('');
const selectAll = computed({
    get: () => {
        return selected.value.length === options.length;
    },
    set: (value: boolean) => {
        if (value) {
            selected.value = options.map((option) => option[valueField]) as string[];
        } else {
            selected.value = [];
        }
    },
});

const isIndeterminate = computed(() => {
    return selected.value.length > 0 && selected.value.length < options.length;
});

const hidePopover = () => {
    popover.value?.hide?.();
}

const confirm = () => {
    emit('update:modelValue', selected.value);
    hidePopover();
}
const reset = () => {
    emit('update:modelValue', []);
    hidePopover();
}

const onHide = () => {
    selected.value = [...modelValue];
}

</script>

<template>
    <div class="d-flex align-items-center ">
        <span class="text-gray-500">{{ data.column.label }}</span>
        <el-popover ref="popover" placement="bottom" width="200" trigger="click" @hide="onHide">
            <div>
                <div>
                    <el-input v-model="searchKey" placeholder="请输入内容" size="small" clearable></el-input>
                </div>
                <div>
                    <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate">全选</el-checkbox>
                    <el-checkbox-group v-model="selected" class="d-flex flex-column">
                        <el-checkbox v-for="option in options" :key="option[valueField]" :label="option[valueField]">{{
                            option[labelField]
                        }}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class=" text-end">
                    <el-button type="primary" size="small" @click="confirm">确定</el-button>
                    <el-button size="small" @click="reset">清空</el-button>
                </div>
            </div>
            <template #reference>
                <el-icon :class="{ 'color-3a85ff': hasFilter }" :size="16"
                    class="hover-color-3a85ff ms-1 cursor-pointer">
                    <Filter />
                </el-icon>
            </template>
        </el-popover>
    </div>
</template>