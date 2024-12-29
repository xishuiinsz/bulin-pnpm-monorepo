<script setup lang="ts">
import { ref } from 'vue';
import { getImageUrlByName, useImagesLoaded } from './utils';

const list = ['bg.png', 'help.png', 'img.jpg', 'typescript-1529x1291.png'].map(getImageUrlByName);
const root = ref(null);
function imagesLoadedCallback() {
  console.log('imagesLoadedCallback');
}
useImagesLoaded(imagesLoadedCallback);
</script>

<template>
  <div class="scroll-drive-animation">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          检测容器内图片加载
        </span>
      </div>
    </div>
    <div class="container">
      <div ref="root" class="w-100 h-100 position-relative">
        <template v-for="item in list" :key="item">
          <div class="card mt-2" style="width: 18rem">
            <img :src="item" class="card-img-top" alt="..." />
            <div class="card-body">
              <h5 class="card-title">
                Card title
              </h5>
              <p class="card-text">
                Some quick example text to build on the card title and make up the bulk of the card's content.
              </p>
              <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-drive-animation {
}
</style>
