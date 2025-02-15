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
    <thead v-if="columnsList.length">
      <tr>
        <th v-for="(item, index) in columnsList" :key="item.field" :class="`col-${index + 1}`">
          {{ item.title }}
        </th>
      </tr>
    </thead>
    <tbody v-if="tableList.length">
      <tr v-for="(row, rowIndex) in tableList" :key="rowIndex">
        <template v-if="columnsList.length">
          <td v-for="(col, colIndex) in columnsList" :key="colIndex">
            <template v-if="typeof col.formatter === 'function'">
              <template v-if="isVNode(col.formatter({ row, rowIndex, col, colIndex }))">
                <component :is="col.formatter({ row, rowIndex, col, colIndex })" />
              </template>
              <template v-else>
                <div :class="`col-${col.field}`" v-html="col.formatter({ row, rowIndex, col, colIndex })" />
              </template>
            </template>
            <template v-else>
              <div>{{ row[col.field] }}</div>
            </template>
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
.simple-table {
  border-collapse: collapse;
  font-family: Microsoft YaHei;
  font-size: 14px;

  &.bordered {

    th,
    td {
      border: 1px solid rgb(160 160 160);

    }
  }

  &.thead-bordered-bottom {

    th {
      border-bottom: 1px solid rgb(160 160 160);

    }
  }

  th,
  td {
    white-space: nowrap;
    padding: 8px 10px;
  }

}
</style>
