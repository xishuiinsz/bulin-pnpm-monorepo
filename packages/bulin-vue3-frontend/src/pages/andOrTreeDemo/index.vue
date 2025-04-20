<script setup>
import { getAncestorByClass } from '@/utils/dom';
import { getFullLetters } from '@u/index';
import { getCurrentInstance, provide, reactive, ref } from 'vue';
import AndOrTree from './AndOrTree.vue';
import { uniqueId } from 'lodash';
import { ElMessage } from 'element-plus';

const letters = getFullLetters();
const nodeType = {
  leaf: 'LEAF',
  and: 'AND',
  or: 'OR',
  AND: '与',
  OR: '或',
}
const maxLevel = 4;
const treeData = reactive({

});

const getUUID = () => {
  const prefix = 'node-';
  return uniqueId(prefix);
}

/**
 * 删除节点并自动优化逻辑树
 * @param {object} root - 树的根节点
 * @param {object} targetNode - 要删除的目标节点
 * @returns {object} - 返回新的树（深拷贝，无副作用）
 */
function deleteNodeAndOptimize(root, targetNode) {
  // 深拷贝原始树以避免副作用
  const newTree = JSON.parse(JSON.stringify(root));

  // 内部递归查找父节点并删除目标
  const _deleteAndOptimize = (node, target) => {
    if (node.children) {
      // 查找目标节点是否在直接子节点中
      const index = node.children.findIndex(child =>
        child.value === target.value && child.type === target.type,
      );

      // 如果找到直接子节点，删除它
      if (index !== -1) {
        node.children.splice(index, 1);
        // 优化逻辑节点：若子节点数量不合法，调整节点类型
        if (node.type === '与' && node.children.length < 2) {
          // 如果只剩一个子节点，用该子节点替代当前节点
          return node.children[0];
        }
        return node;
      }

      // 递归处理子节点
      for (let i = 0; i < node.children.length; i++) {
        const result = _deleteAndOptimize(node.children[i], target);
        // 如果子节点被优化（如替换为子节点的子节点），更新当前节点的子节点
        if (result !== node.children[i]) {
          node.children[i] = result;
        }
      }
    }
    return node;
  };

  // 执行删除和优化
  return _deleteAndOptimize(newTree, targetNode);
}

function nodeRemoveHandler(node) {
  const tree = deleteNodeAndOptimize(treeData, node);
  Object.assign(treeData, tree);
}

function typeLabelClick(data) {
  const _type = data.type === nodeType.and ? nodeType.or : nodeType.and;
  Object.assign(data, { type: _type });
}
// 拖拽信号
const dragDropFlag = ref(false);
const providedData = { nodeRemoveHandler, nodeType, typeLabelClick, dragDropFlag };
provide('providedData', providedData);

const getNodeById = (id) => {
  const _getNodeById = (node, id) => {
    if (String(node.id) === String(id)) return node;
    if (node.children) {
      for (const child of node.children) {
        const result = _getNodeById(child, id);
        if (result) return result;
      }
    }
    return null;
  };
  return _getNodeById(treeData, id);
};

function mousedown(e) {
  const elTagSelector = 'drag-item';
  dragDropFlag.value = true;
  const target = getAncestorByClass(e.target, elTagSelector);
  // 如果没有命中拖拽对象就退出。
  if (!target) return;
  const cloneTarget = target.cloneNode(true);
  Object.assign(cloneTarget.style, { 'position': 'fixed', 'pointer-events': 'none' });
  Object.assign(document.body.style, { 'user-select': 'none' });
  document.body.appendChild(cloneTarget);
  const mousemove = (event) => {
    Object.assign(document.body.style, { cursor: 'move' });
    Object.assign(cloneTarget.style, { left: `${event.pageX}px`, top: `${event.pageY}px` });
  };

  const mouseup = (e) => {
    dragDropFlag.value = false;
    document.body.removeChild(cloneTarget);
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    Object.assign(document.body.style, { cursor: 'auto' });
    const dropElement = getAncestorByClass(e.target, 'node-leaf-content');
    if (dropElement) {
      const dropId = dropElement.getAttribute('data-id');
      const nodeItem = getNodeById(dropId);
      if (nodeItem) {
        if(nodeItem.level >= maxLevel) {
          // 如果节点已经到达最大层级，直接返回
          ElMessage.error('节点已到达最大层级，无法添加子节点');
          return;
        }
        const cloneNode = {
          type: nodeType.leaf,
          value: nodeItem.value,
          supperId: nodeItem.id,
          level: nodeItem.level + 1,
          id: getUUID(),
        };
        const newNode = {
          type: nodeType.leaf,
          value: target.innerText,
          supperId: nodeItem.id,
          level: nodeItem.level + 1,
          id: getUUID(),
        };
        Reflect.deleteProperty(nodeItem, 'value');
        Object.assign(nodeItem, { type: nodeType.and });
        nodeItem.children = [cloneNode, newNode]
      }
      return;
    }
    const dropContainer = getAncestorByClass(e.target, 'and-or-tree-container');
    if (dropContainer) {
      if (Object.keys(treeData).length) {
        // 如果树不为空，添加到树中
        const newNode = {
          type: nodeType.leaf,
          value: target.innerText,
          supperId: treeData.id,
          level: treeData,
          id: getUUID(),
        };
        // 如果为单叶
        if (treeData.type === nodeType.leaf) {
          const cloneNode = {
            type: nodeType.leaf,
            value: treeData.value,
            supperId: treeData.id,
            level: treeData.level + 1,
            id: getUUID(),
          };
          Reflect.deleteProperty(treeData, 'value');
          Object.assign(treeData, { type: nodeType.and });
          treeData.children = [cloneNode, newNode]
        } else {
          treeData.children.push(newNode)
        }

      } else {
        // 如果树为空，直接赋值
        Object.assign(treeData, {
          type: nodeType.leaf,
          id: getUUID(),
          supperId: null,
          level: 1,
          value: target.innerText,
        });
      }
    }
  };

  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
}
</script>

<template>
  <div class="and-or-tree-demo w-100 h-100 d-flex flex-column overflow-hidden">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          与或树
        </span>
      </div>
    </div>
    <div class="container w-100 overflow-hidden flex-fill">
      <div class="and-or-tree-subject h-100 m-auto d-flex">
        <div class="d-flex w-100 h-100 gap-4">
          <div @mousedown="mousedown"
            class="columns-list border-danger border border-1 rounded-2 p-3 align-items-center d-flex w300 flex-wrap gap-2">
            <el-tag class="drag-item" v-for="letter in letters" :key="letter" type="primary">
              {{ letter }}
            </el-tag>
          </div>
          <div class="and-or-tree-container border border-1 border-info rounded-2 flex-fill p-4"
            :class="{ 'drag-drop-mode': dragDropFlag }">
            <template v-if="Object.keys(treeData).length">
              <AndOrTree :node="treeData" />
            </template>
            <div v-else class="text-center h-100 text-muted flex-fill d-flex align-items-center justify-content-center">
              <span>请从左侧拖拽类目</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.and-or-tree-demo {
  :deep(.drag-drop-mode) {
    .node-leaf-content {
      &:hover {
        border-color: #3a85ff !important;
      }
    }
  }

}
</style>
