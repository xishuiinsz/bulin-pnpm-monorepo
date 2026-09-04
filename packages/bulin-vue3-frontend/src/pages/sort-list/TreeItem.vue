<script setup lang="ts">

interface SortListItem {
    id: number;
    text: string;
    children?: SortListItem[];
}

defineProps<{
    list: SortListItem[];
}>();





</script>

<template>
    <div v-for="item in list" :key="item.id" class="list-group-item nested-1">{{ item.text }}
        <template v-if="item.children?.length">
            <div ref="groupRef" :id="String(item.id)" class="list-group nested-sortable">
                <TreeItem :list="item.children" />
            </div>
        </template>
    </div>
</template>