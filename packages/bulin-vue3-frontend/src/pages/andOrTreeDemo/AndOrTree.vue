<script setup>
import { inject } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits('nodeRemove');
function typeLabelClick(data) {
  const mapping = new Map([['或', '与'], ['与', '或']]);
  const { type } = data;
  const _type = mapping.get(type);
  Object.assign(data, { type: _type });
}

const providedData = inject('providedData');
const { nodeRemoveHandler } = providedData;
</script>

<template>
  <ul class="and-or-tree-container">
    <li class=" position-relative">
      <div v-if="node.type === 'LEAF'" class="node-leaf">
        <div class="node-leaf-content">
          {{ node.value }}
        </div>
        <div>
          <el-button type="danger" @click="nodeRemoveHandler(node)">
            删除
          </el-button>
        </div>
      </div>
      <div v-else class="node-type position-absolute">
        <div class="node-type-label cursor-pointer" @click="typeLabelClick(node)">
          {{ node.type }}
        </div>
      </div>
      <AndOrTree
        v-for="child in node.children" v-if="node.children" :key="child.value || child.type"
        :node="child"
      />
    </li>
  </ul>
</template>

<style scoped>
li {
    list-style: none;
    margin-top: 16px;
}

.node-leaf {
    width: 200px;
    height: 48px;
    background-color: pink;
    display: flex;
    justify-content: space-between;
    align-items: center;

}

.node-type {
    left: 0;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 1;

    &::before {
        content: '';
        height: 100%;
        width: 1px;
        position: absolute;
        background-color: red;
        left: 50%;
        transform: translateX(-50%);
    }
}

.node-type-label {
    position: relative;
    z-index: 10;
    background-color: red;
}

.tree ul {
    list-style-type: none;
    padding-left: 20px;
    position: relative;
}

.tree li {
    margin: 10px 0;
    position: relative;
}

.tree li::before {
    content: "";
    position: absolute;
    left: -15px;
    top: 50%;
    border-left: 1px solid #ccc;
    height: 100%;
}

.tree li::after {
    content: "";
    position: absolute;
    left: -15px;
    top: 50%;
    border-top: 1px solid #ccc;
    width: 15px;
}

.tree li:last-child::before {
    height: 50%;
}

.node {
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    display: inline-block;
}

.node.and {
    background-color: #d4edda;
}

.node.or {
    background-color: #f8d7da;
}

.node.leaf {
    background-color: #fff3cd;
}
</style>
