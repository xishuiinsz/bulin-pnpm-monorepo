<script setup lang="ts">
import { computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData, { rootClass } from './page';
import { ref, watch } from 'vue'
import { unionBy } from 'lodash';

import type { TreeInstance } from 'element-plus'

interface Tree {
  [key: string]: any
}

const filterText = ref('')
const filterUser = ref('')
const treeRef = ref<TreeInstance>()

const defaultProps = {
  children: 'children',
  label: 'label',
}

// 选中的、未去重的叶子节点
const checkedLeaves = ref<any[]>([]);

//  选中的、已去重的叶子节点
const uniqueLeaves = computed(() => {
  const users = unionBy(checkedLeaves.value, 'name');
  return users;

});

const filteredLeaves = computed(() => {
  const users = uniqueLeaves.value
  return users.filter(user => {
    if (!filterUser.value) return true;
    return user.label.includes(filterUser.value) || user.name.includes(filterUser.value);
  });
})

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

const data: Tree[] = [
  {
    id: 0,
    label: '全部',
    children: [
      {
        id: 1,
        label: '前端技术小组',
        children: [
          {
            id: 4,
            label: '张三',
            name: 'zhangsan',
          },
          {
            id: 5,
            label: '张三丰',
            name: 'zhangsanfeng',
          },
        ],
      },
      {
        id: 2,
        label: '测试技术小组',
        children: [
          {
            id: 6,
            label: '张三',
            name: 'zhangsan',
          },
          {
            id: 7,
            label: '王五',
            name: 'wangwu',
          },
          {
            id: 15,
            label: '张三丰',
            name: 'zhangsanfeng',
          },
        ],
      },
      {
        id: 3,
        label: '后端技术小组',
        children: [
          {
            id: 8,
            label: '王五',
            name: 'wangwu',
          },
          {
            id: 9,
            label: '张小刚',
            name: 'zhangxiaogang',
          },
          {
            id: 10,
            label: '刘备',
            name: 'liubei',
          },
          {
            id: 11,
            label: '张三',
            name: 'zhangsan',
          }
        ],
      },
    ]
  }
]

const activeTab = ref('group2');

const getIdListByNames = (name: string | string) => {
  if (Array.isArray(name) && name.length) {
    return name.map(n => getIdListByNames(n)).flat();
  }
  return data[0].children?.flatMap(group => {
    return group.children?.filter(user => user.name === name).map(user => user.id) || [];
  }) || [];
}

const updateTreeCheck = () => {
  const names = uniqueLeaves.value.map(item => item.name);
  const idList = names.flatMap(name => getIdListByNames(name));
  treeRef.value?.setCheckedKeys(idList, true);
}

const check = (data: any) => {
  const checkedNodes = treeRef.value?.getCheckedNodes(true, false) || [];
  if (!checkedNodes.length) {
    checkedLeaves.value = [];
    updateTreeCheck();
    return;
  }
  if (!checkedLeaves.value.length) {
    checkedLeaves.value = checkedNodes;
    updateTreeCheck();
    return;
  }
  const removedLeaves = checkedLeaves.value.filter(item => {
    return !checkedNodes.some((node: any) => node.id === item.id);
  });
  if (removedLeaves.length) {
    // 有被取消选中的节点
    const removedNames = removedLeaves.map(node => node.name);
    checkedLeaves.value = checkedLeaves.value.filter(item => {
      return !removedNames.includes(item.name);
    });
  } else {
    // 全是新增选中的节点
    checkedLeaves.value = checkedLeaves.value.concat(checkedNodes);
  }
  updateTreeCheck();
}



const removeUser = (user) => {
  checkedLeaves.value = checkedLeaves.value.filter(item => item.name !== user.name);
  updateTreeCheck();
}

const tabChange = (tab) => {
  if (uniqueLeaves.value.length) {
    nextTick(() => {
      if (uniqueLeaves.value.length) {
        updateTreeCheck();
      }
    });
  }
} 
</script>

<template>
  <div :class="rootClass" class="w-100 h-100 d-flex flex-column">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          {{ pageData.title }}
        </span>
      </div>
    </div>
    <div class="container w-100 h-100 flex-fill">
      <div class=" font-weight-bold fs-5">2套数据源的Tree</div>
      <div class="d-flex flex-column gap-2">
        <el-tabs @tab-change="tabChange" v-model="activeTab">
          <el-tab-pane name="group1" label="群组1">
          </el-tab-pane>
          <el-tab-pane name="group2" label="群组2">
          </el-tab-pane>
        </el-tabs>
        <div class="d-flex gap-4">
          <div class="left border rounded p-4 w400">
            <el-input v-model="filterText" clearable class="w-60 mb-2" placeholder="请输入关键字搜索" />

            <el-tree ref="treeRef" node-key="id" :key="activeTab" class="filter-tree" show-checkbox :data="data"
              :props="defaultProps" default-expand-all @check="check" :filter-node-method="filterNode" />
          </div>
          <div class="right border rounded p-4 w400">
            <el-input clearable v-model="filterUser" class="w-60 mb-2" placeholder="请输入关键字" />
            <div class="">
              <div v-for="item in filteredLeaves" :key="item.name">
                <el-tag closable @close="removeUser(item)" class="m-1">{{ item.label }} ({{ item.name }})</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<style lang="scss" scoped>
.multi-sources-trees {
  .w400 {
    width: 400px;
  }
}
</style>
