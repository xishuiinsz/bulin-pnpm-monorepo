<script setup>
import { isVNode } from 'vue';

defineProps({
  columnsList: {
    type: Array,
    default: () => [],
  },
  tableList: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <table class="simple-table">
    <thead>
      <tr>
        <th v-for="(item, index) in columnsList" :key="item.field" :class="`col-${index + 1}`">
          {{ item.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in tableList" :key="rowIndex">
        <td v-for="(col, colIndex) in columnsList" :key="colIndex">
          <template v-if="typeof col.formatter === 'function'">
            <template v-if="isVNode(col.formatter({ row, rowIndex, col, colIndex }))">
              <component :is="col.formatter({ row, rowIndex, col, colIndex })" />
            </template>
            <template v-else>
              <div v-html="col.formatter({ row, rowIndex, col, colIndex })" />
            </template>
          </template>
          <template v-else>
            <div>{{ row[col.field] }}</div>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
table.simple-table {

  border-collapse: collapse;
  border: 2px solid rgb(140 140 140);
  font-family: sans-serif;
  font-size: 0.8rem;
  letter-spacing: 1px;

  thead {
    background-color: rgb(228 240 245);
  }

  th,
  td {
    border: 1px solid rgb(160 160 160);
    padding: 8px 10px;
  }

  td:last-of-type {
    text-align: center;
  }

  tbody>tr:nth-of-type(even) {
    background-color: rgb(237 238 242);
  }

}
</style>
