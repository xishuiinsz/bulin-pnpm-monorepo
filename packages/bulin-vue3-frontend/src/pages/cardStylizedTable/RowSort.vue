<script setup lang="ts">
import { Position } from '@element-plus/icons-vue';
import { getAncestorByClass } from '@/utils/dom';
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
const mouseenter = (e, data) => {
    if (!instance) {
        const container = getAncestorByClass(e.target, 'tbody') as HTMLDivElement;
        init(container, data)
    }
}

</script>

<template>
    <el-table-column type="index" label="序号" width="120">
        <template #default="scope">
            <div @mouseenter="mouseenter($event, scope)"
                class="drag-drop-handle cursor-pointer d-flex align-items-center">
                <el-icon>
                    <Position />
                </el-icon>
                <span class="ms-3">{{ scope.$index + 1 }}</span>
            </div>
        </template>
    </el-table-column>
</template>
