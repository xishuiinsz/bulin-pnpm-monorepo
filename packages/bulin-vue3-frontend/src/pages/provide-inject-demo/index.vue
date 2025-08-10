<script lang="ts" setup>
import { onMounted, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Child from './Child.vue';
import pageData from './page';
import usePageHook from './utils';

usePageHook();
</script>

<template>
  <div class="provide-inject-demo w-100 h-100 d-flex flex-column">
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
      <h3>父元素</h3>
      <Child />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.provide-inject-demo {}
</style>
