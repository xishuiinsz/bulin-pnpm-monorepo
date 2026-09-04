<script setup lang="ts">
import { ref, nextTick, onMounted, useTemplateRef } from 'vue';
import Sortable from 'sortablejs';
import TreeItem from './TreeItem.vue';

interface SortListItem {
    id: number;
    text: string;
    children?: SortListItem[];
}

interface Props {
    list: SortListItem[];
}

const props = defineProps<Props>();


const rootContainer = useTemplateRef('root');

// 在树中按 id 查找数据项
const findItemById = (items: SortListItem[], id: number): SortListItem | undefined => {
    for (const item of items) {
        if (item.id === id) {
            return item;
        }
        if (item.children) {
            const found = findItemById(item.children, id);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};

// 获取列表容器对应的数据数组：根容器对应 list 本身；
// 嵌套容器的 DOM id 属性为其父项的 id（见 TreeItem），据此定位到父项的 children
const getListByContainer = (containerEl: HTMLElement): SortListItem[] | null => {
    const rootEl = rootContainer.value?.querySelector('.nested-sortable');
    if (containerEl === rootEl) {
        return props.list;
    }
    const parent = findItemById(props.list, Number(containerEl.id));
    if (!parent) return null;
    parent.children = parent.children ?? [];
    return parent.children;
};

// 拖拽结束：只有同级元素才可拖拽排序（各容器 group 唯一，from === to），
// 因此只需根据 oldIndex / newIndex 对同一数组重排
const onSortableEnd = (evt: { from: HTMLElement; to: HTMLElement; oldIndex?: number; newIndex?: number }) => {
    const { from, to, oldIndex, newIndex } = evt;
    if (from !== to || oldIndex == null || newIndex == null || oldIndex === newIndex) return;

    const target = getListByContainer(from);
    if (!target) return;

    // 从旧位置移除，再插入新位置
    const [moved] = target.splice(oldIndex, 1);
    target.splice(newIndex, 0, moved!);
    console.log('list.value: ', props.list);

};

const init = () => {
    if (rootContainer.value) {
        const elements = rootContainer.value.querySelectorAll('.list-group');
        elements.forEach(el => {
            const sortable = new Sortable(el as HTMLElement, {
                group: el.getAttribute('id'),
                animation: 150,
                fallbackOnBody: true,
                ghostClass: 'bg-primary',
                onEnd: onSortableEnd,
            });
        })
    }
}
onMounted(() => {
    nextTick(init)
})

</script>

<template>
    <div ref="root" class="w-50">
        <div ref="groupRef" id="nestedDemo" class="list-group col nested-sortable">
            <TreeItem :list="list" />
        </div>
    </div>
</template>