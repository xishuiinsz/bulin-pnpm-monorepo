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
  <div class="node-leaf-content w-100 d-flex justify-content-between align-items-center">
    <div>{{ node.value }}</div>
    <el-button type="danger" @click="nodeRemoveHandler(node)">
      删除
    </el-button>
  </div>
</template>
