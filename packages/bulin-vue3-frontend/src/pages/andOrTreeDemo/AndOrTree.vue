<script setup>
import { inject } from 'vue';
import ContentItem from './ContentItem.vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits('nodeRemove');



const providedData = inject('providedData');
const { nodeRemoveHandler, nodeType, typeLabelClick } = providedData;
</script>

<template>
  <div class="and-or-tree-component">
    <div class="and-or-tree-item w-100 d-flex align-items-center gap-3 position-relative">
      <div v-if="node.type === 'LEAF'" class="node-leaf w-100">
        <ContentItem :node="node" @node-remove="nodeRemoveHandler" />
      </div>
      <template v-else>
        <div class="node-type">
          <div class="node-type-label cursor-pointer" @click="typeLabelClick(node)">
            <el-button>
              {{ nodeType[node.type] }}
            </el-button>
          </div>
        </div>
        <div v-if="node.children" class="flex-fill d-flex flex-column gap-2">
          <AndOrTree v-for="child in node.children" :key="child.id" :node="child" />
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.and-or-tree-component {

  .node-leaf {
    display: flex;
    justify-content: space-between;
    align-items: center;

  }

  .node-type {
    display: flex;
    align-items: center;

    &::before {
      content: '';
      height: 100%;
      width: 1px;
      position: absolute;
      background-color: red;
      left: 20px;
      transform: translateX(-50%);
    }
  }

  .node-type-label {
    position: relative;
    z-index: 10;
  }

}
</style>
