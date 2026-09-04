<script setup lang="ts">
import { Filter } from '@element-plus/icons-vue'
import type { ElPopover } from 'element-plus';
import { ref, computed, watch, type WatchHandle } from 'vue';

interface Props {
    data: {
        column: {
            label: string;
        };
    };
    options?: Array<Record<string, string>>;
    modelValue: string[];
    valueField?: string;
    labelField?: string;
    fetchOptions?: (searchKey: string) => Promise<Array<Record<string, string>>>;
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
    (e: 'confirm', value: string[]): void;
    (e: 'reset', value: string[]): void;
}>();

const popover = ref<InstanceType<typeof ElPopover> | null>(null);


const props = defineProps<Props>();
const { data = {}, valueField = 'value', labelField = 'label', } = props

let stopWatch: WatchHandle | null = null

const doWatch = () => {
    stopWatch = watch(() => props.modelValue, (newVal: string[]) => {
        selected.value = newVal;
    });
}
const allOptions = ref(props.options ?? []);

const filteredOptions = computed(() => {
    const _searchKey = searchKey.value?.trim();
    if (_searchKey) {
        const filtered = (option: Record<string, string>) => {
            const _label = option?.[labelField]?.toLowerCase();
            const _value = _searchKey.toLowerCase();
            return _label?.includes(_value);
        }
        return allOptions.value.filter(filtered);
    }
    return allOptions.value;
});

const loading = ref(false);

const hasFilter = computed(() => {
    return props.modelValue.length > 0;
});

const selected = ref<string[]>([...props.modelValue]);
const searchKey = ref<string>('');
const selectAll = computed({
    get: () => {
        return filteredOptions.value.length && selected.value.length === filteredOptions.value.length;
    },
    set: (value: boolean) => {
        if (value) {
            selected.value = filteredOptions.value.map((option) => option[valueField]) as string[];
        } else {
            selected.value = [];
        }
    },
});

const isIndeterminate = computed(() => {
    return selected.value.length > 0 && selected.value.length < filteredOptions.value.length;
});

const hidePopover = () => {
    popover.value?.hide?.();
}

const confirm = () => {
    emit('update:modelValue', selected.value);
    emit('confirm', selected.value);
    hidePopover();
}
const reset = () => {
    emit('update:modelValue', []);
    emit('reset', []);
    hidePopover();
}

const onHide = () => {
    selected.value = [...props.modelValue];
    doWatch();
}

const fetchOptionsBySearchKey = async () => {
    if (typeof props.fetchOptions === 'function') {
        loading.value = true;
        const res = await props.fetchOptions(searchKey.value);
        allOptions.value = res;
        loading.value = false;
    }
}

const onShow = () => {
    loading.value = true;
    stopWatch?.();
    fetchOptionsBySearchKey();
}

</script>

<template>
    <div class="d-flex align-items-center ">
        <span class="text-gray-500">{{ data.column?.label ?? '请设置标题' }}</span>
        <el-popover ref="popover" placement="bottom" width="200" trigger="click" @show="onShow" @hide="onHide">
            <div>
                <div>
                    <el-input v-model="searchKey" placeholder="请输入内容" size="small" clearable></el-input>
                </div>
                <div v-loading="loading" class=" min-h-6 mt-2 pb-2" style="max-height: 200px; overflow-y: auto;">
                    <el-checkbox v-if="filteredOptions.length" v-model="selectAll"
                        :indeterminate="isIndeterminate">全选</el-checkbox>
                    <el-checkbox-group v-model="selected" class="d-flex flex-column">
                        <el-checkbox v-for="option in filteredOptions" :key="option[valueField]"
                            :label="option[valueField]">{{
                                option[labelField]
                            }}</el-checkbox>
                    </el-checkbox-group>
                    <div v-if="!filteredOptions.length" class="d-flex justify-content-center align-items-center h-6">
                        <span class="text-gray-500">暂无数据</span>
                    </div>
                </div>
                <div class=" mt-2 text-end">
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