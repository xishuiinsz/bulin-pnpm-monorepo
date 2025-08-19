<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData from './page';
</script>

<template>
  <div class="auto-generate-page w-100 h-100 d-flex flex-column">
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
      <div class="login-container h-50" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auto-generate-page {
  .login-container {
    width: 100%;
    background: url("./img/bg2.png") no-repeat right bottom, linear-gradient(135deg, lightgreen 0, lightblue 100%);
    background-size: contain;
  }
}
</style>
