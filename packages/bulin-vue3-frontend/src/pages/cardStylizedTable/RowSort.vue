<script setup lang="ts">
import { Position } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';

let instance
const init = (element: HTMLDivElement, data) => {
    instance = new Sortable(element, {
        handle: '.drag-drop-handle', // handle's class
        animation: 150,
        onEnd(evt: any) {
            const reactiveList = data.store.states.data;
            const { oldIndex, newIndex } = evt;
            const [row] = reactiveList.value.splice(oldIndex, 1);
            reactiveList.value.splice(newIndex, 0, row)
        }
    });
}
const mouseenter = (data) => {
    if (!instance) {
        const container = document.querySelector('.el-table__body-wrapper tbody') as HTMLDivElement;
        init(container, data)
    }
}

</script>

<template>
    <el-table-column type="index" label="序号" width="120">
        <template #default="scope">
            <div @mouseenter="mouseenter(scope)" class="drag-drop-handle cursor-pointer d-flex align-items-center">
                <el-icon>
                    <Position />
                </el-icon>
                <span class="ms-3">{{ scope.$index }}</span>
            </div>
        </template>
    </el-table-column>
</template>
