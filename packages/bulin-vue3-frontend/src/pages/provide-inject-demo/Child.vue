<script lang="ts" setup>
import { defineProps, inject } from 'vue';
import { injectKey } from './utils';

const { title, click } = inject(injectKey, { title: '', click: () => { } });
</script>

<template>
  <div class="child-component">
    <h2>{{ title }}</h2>
    <slot />
    <el-button @click="click('child element clicked')">
      Click Me
    </el-button>
  </div>
</template>

<style scoped>
.child-component {
  border: 1px solid #eee;
  padding: 16px;
  margin: 16px 0;
}
</style>
