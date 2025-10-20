<script setup>
import { ref } from 'vue';
import data from './page';
import SemiCircle from './SemiCircle.vue';

const value = ref('30');
</script>

<template>
  <div class="semi-circle w-100 h-100 d-flex flex-column">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          {{ data.title }}
        </span>
      </div>
    </div>
    <div class="container w-100 h-100 flex-fill">
      <div class="progress-ring-wrapper">
        <SemiCircle :value="value" />
      </div>
      <el-input-number
        v-model="value" align="left" :disabled-scientific="true" :controls="false" :min="0" :max="100"
        precision="1" class="  mt-3 w300"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.semi-circle {
  .progress-ring-wrapper {
    width: 12.5rem;
    aspect-ratio: 2;
    overflow: hidden;
  }
}
</style>
