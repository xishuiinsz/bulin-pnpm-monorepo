<script setup lang="ts">
import { Filter } from '@element-plus/icons-vue'
import type { ElPopover } from 'element-plus';
import { ref, computed, watch, onMounted, type WatchHandle } from 'vue';

interface Props {
    data: {
        column: {
            label: string;
            property: string;
        };
    };
    modelValue: string;

}

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'confirm', value: string): void;
    (e: 'reset', value: string): void;
}>();

const popover = ref<InstanceType<typeof ElPopover> | null>(null);

const props = defineProps<Props>();

const hasFilter = computed(() => {
    return Boolean(props.modelValue?.trim?.());
});

const searchKey = ref<string>(props.modelValue);

let stopWatch: WatchHandle | null = null

const doWatch = () => {
    stopWatch = watch(() => props.modelValue, (newVal: string) => {
        if (newVal !== searchKey.value) {
            searchKey.value = newVal;
        }
    });
}


const hidePopover = () => {
    popover.value?.hide?.();
}

const confirm = () => {
    emit('update:modelValue', searchKey.value);
    emit('confirm', searchKey.value);
    hidePopover();
}
const reset = () => {
    emit('update:modelValue', '');
    emit('reset', props.data.column.property)
    hidePopover();
}

const onShow = () => {
    stopWatch?.();
}
const onHide = () => {
    doWatch();
    searchKey.value = props.modelValue;
}

onMounted(() => {
    stopWatch?.();
})

</script>

<template>
    <div class="d-flex align-items-center ">
        <span class="text-gray-500">{{ data.column?.label ?? '请设置标题' }}</span>
        <el-popover ref="popover" placement="bottom" width="200" trigger="click" @show="onShow" @hide="onHide">
            <div>
                <div>
                    <el-input :model-value="searchKey" placeholder="请输入内容" size="small" clearable
                        @update:model-value="(val: string) => (searchKey = val)"></el-input>
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