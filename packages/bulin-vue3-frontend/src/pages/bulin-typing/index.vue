<script setup lang="ts">
import { ref } from "vue";
import pageData, { data, rootClass } from "./page";


const abcList = data.split("");

const getIndex = (base: number = 0) => {

  const letter = abcList[base];
  const regex = /\s/;
  if (regex.test(letter)) {
    return getIndex(base + 1);
  }
  return base
}

const index = ref(getIndex());

window.addEventListener("keyup", (event) => {
  if (event.key === abcList[index.value]) {
    index.value = getIndex(index.value + 1);
  }
})




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
    <div class="container w-100 h-100 flex-fill position-relative">
      <h4>{{ JSON.stringify(pageData, null, 4) }}</h4>
      <div>如题所示，用来自动生成页面的模板</div>
      <div class="abc-list fs18 mt-3">
        <span :class="{ 'active fw-bold fs20': index === i }" class="abc-item" v-for="(letter, i) in abcList"
          :key="i">{{ letter
          }}</span>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.h32 {
  height: 32px;
}

.bulin-typing {
  .abc-list {
    min-height: 32px;

    .abc-item {
      &.active {
        color: red;
      }
    }
  }
}
</style>
