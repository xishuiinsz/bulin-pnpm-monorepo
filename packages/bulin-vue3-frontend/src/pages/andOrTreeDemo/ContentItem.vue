<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['nodeRemove']);

function nodeRemoveHandler(data) {
  emit('nodeRemove', data);
}
</script>

<template>
  <div :data-id="node.id"
    class="node-leaf-content bg-f5f5f5 w-100 h40 px-2 border d-flex justify-content-between align-items-center">
    <div>{{ node.value }}</div>
    <el-button type="danger" @click="nodeRemoveHandler(node)">
      删除
    </el-button>
  </div>
</template>
