<script setup>
import { getAncestorByClass } from '@/utils/dom';
import { getFullLetters } from '@u/index';
import { getCurrentInstance, provide, reactive, ref } from 'vue';
import AndOrTree from './AndOrTree.vue';

const letters = getFullLetters();
const instance = getCurrentInstance();
const treeData = reactive({
  type: '或',
  children: [
    {
      type: '与',
      children: [
        { type: 'LEAF', value: 'A' },
        { type: 'LEAF', value: 'B' },
      ],
    },
    {
      type: '与',
      children: [
        { type: 'LEAF', value: 'C' },
        {
          type: '与',
          children: [
            { type: 'LEAF', value: 'D' },
            { type: 'LEAF', value: 'E' },
          ],
        },
      ],
    },
  ],
});

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

const providedData = { nodeRemoveHandler };
provide('providedData', providedData);

function mousedown(e) {
  const dragSelecgtor = 'drag-drop-mode';
  const container = instance.proxy.$el;
  console.log('container: ', container);
  container.classList.add(dragSelecgtor);
  let target = e.target;
  const elTagSelector = 'el-tag';
  if (!target.classList.contains(elTagSelector)) {
    target = getAncestorByClass(e.target, elTagSelector);
  }

  const cloneTarget = target.cloneNode(true);
  console.log('mousedown cloneTarget', cloneTarget);
  Object.assign(cloneTarget.style, { 'position': 'fixed', 'pointer-events': 'none' });
  Object.assign(document.body.style, { 'user-select': 'none' });
  document.body.appendChild(cloneTarget);
  const mousemove = (event) => {
    Object.assign(document.body.style, { cursor: 'move' });
    Object.assign(cloneTarget.style, { left: `${event.pageX}px`, top: `${event.pageY}px` });
    console.log('mousemove event: ', event);
  };
  const mouseup = () => {
    container.classList.remove(dragSelecgtor);
    document.body.removeChild(cloneTarget);
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    Object.assign(document.body.style, { cursor: 'default' });
  };
  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
}
</script>

<template>
  <div class="and-or-tree w-100 h-100 d-flex flex-column overflow-hidden">
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
      <div class="and-or-tree-content h-100 m-auto d-flex">
        <div class="d-flex h-100 gap-4">
          <div class="columns-list d-flex w300 flex-wrap gap-2">
            <el-tag v-for="letter in letters" :key="letter" type="primary" @mousedown.capture="mousedown">
              {{ letter }}
            </el-tag>
          </div>
          <div class="and-or-tree-container">
            <AndOrTree :node="treeData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.and-or-tree {
  &.drag-drop-mode {
    :deep(.and-or-tree-container) {
      .node-leaf {
        &:hover {
          border: 1px solid black;
        }
      }
    }
  }
}
</style>
