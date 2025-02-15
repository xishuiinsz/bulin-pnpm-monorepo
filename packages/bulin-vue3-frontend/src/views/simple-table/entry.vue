<script setup>
import { h } from 'vue';
import SimpleTable from './SimpleTable.vue';

function interestFormatter({ row, rowIndex, col, _colIndex }) {
  const click = () => {
    window.console.log('onClick row: ', row);
    window.console.log('onClick rowIndex: ', rowIndex);
  };
  const vnode = h('div', { class: 'color-853aff cursor-pointer', onClick: click }, row[col.field]);
  return vnode;
}

const columnsList = [{ title: 'Person', field: 'name' }, { title: 'Most interest in', field: 'interest', formatter: interestFormatter }, { title: 'Age', field: 'age' }];
const tableList = [{ name: 'Chris', interest: 'HTML tables', age: '22' }, { name: 'Dennis', interest: 'Web accessibility', age: '45' }, { name: 'Sarah', interest: 'JavaScript frameworks', age: '29' }, { name: 'Karen', interest: 'Web performance', age: '36' },
];
</script>

<template>
  <div class="h-100 d-flex flex-column">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-redpacket_fill" /> 简易表格
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container flex-fill">
      <SimpleTable class="thead-bordered-bottom" :columns-list="columnsList" :table-list="tableList" />
    </div>
  </div>
</template>

<style></style>
