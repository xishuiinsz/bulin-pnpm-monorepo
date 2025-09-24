<script setup lang="ts">
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { genFileId } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData from './page';

const upload = ref<UploadInstance>();
const fileList = ref<File[]>([]);

const color = '#358aff';

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const cachedData = {
  canvas: null as HTMLCanvasElement | null,
  rectConfig: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
};

function drawLine() {
  const { rectConfig } = cachedData;
  const ctx = cachedData.canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(rectConfig.width / 3 + rectConfig.x, rectConfig.y);
  ctx.lineTo(rectConfig.width / 3 + rectConfig.x, rectConfig.height + rectConfig.y);
  ctx.moveTo(rectConfig.width * 2 / 3 + rectConfig.x, rectConfig.height + rectConfig.y);
  ctx.lineTo(rectConfig.width * 2 / 3 + rectConfig.x, rectConfig.y);
  ctx.moveTo(rectConfig.x, rectConfig.height / 3 + rectConfig.y);
  ctx.lineTo(rectConfig.width + rectConfig.x, rectConfig.height / 3 + rectConfig.y);
  ctx.moveTo(rectConfig.x, rectConfig.height * 2 / 3 + rectConfig.y);
  ctx.lineTo(rectConfig.width + rectConfig.x, rectConfig.height * 2 / 3 + rectConfig.y);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function drawRect() {
  if (!cachedData.canvas) {
    return;
  }
  const ctx = cachedData.canvas.getContext('2d');
  ctx.clearRect(0, 0, cachedData.canvas.width, cachedData.canvas.height);
  const { rectConfig } = cachedData;
  ctx.rect(rectConfig.x, rectConfig.y, rectConfig.width, rectConfig.height);
  ctx.strokeStyle = color;
  ctx.stroke();
  drawLine();
}

function mousedownEvent(e: MouseEvent) {
  e.preventDefault();
  if (!cachedData.canvas) {
    return;
  }

  function mousemoveEvent(event: MouseEvent) {
    event.preventDefault();
    if (!cachedData.canvas) {
      return;
    }
    const { movementX, movementY } = event;
    const { rectConfig } = cachedData;
    rectConfig.x += movementX;
    rectConfig.y += movementY;
    drawRect();
  }

  function mouseupEvent() {
    e.preventDefault();
    if (!cachedData.canvas) {
      return;
    }
    cachedData.canvas.removeEventListener('mousemove', mousemoveEvent);
    cachedData.canvas.removeEventListener('mouseup', mouseupEvent);
  }

  cachedData.canvas.addEventListener('mousemove', mousemoveEvent);
  cachedData.canvas.addEventListener('mouseup', mouseupEvent);
}

function initRect() {
  if (!cachedData.canvas) {
    return;
  }
  const { width, height } = cachedData.canvas;
  const initSize = 0.8;
  const centerX = width / 2;
  const centerY = height / 2;
  const rectWidth = width * initSize;
  const rectHeight = height * initSize;
  cachedData.rectConfig = {
    x: centerX - rectWidth / 2,
    y: centerY - rectHeight / 2,
    width: rectWidth,
    height: rectHeight,
  };
}

function preCropper(file: File) {
  if (cachedData.canvas) {
    cachedData.canvas.remove();
    cachedData.canvas = null;
  }
  const container = upload.value?.$el as HTMLElement;
  const img = container.querySelector('img') as HTMLImageElement;
  if (img) {
    cachedData.canvas = document.createElement('canvas');
    cachedData.canvas.className = 'position-absolute top-0 start-0';
    img.parentElement.insertBefore(cachedData.canvas, img);
    cachedData.canvas.width = img.naturalWidth;
    cachedData.canvas.height = img.naturalHeight;
    initRect();
    drawRect();
    cachedData.canvas.addEventListener('mousedown', mousedownEvent);
  }
}
</script>

<template>
  <div class="jigsaw-puzzle-page w-100 h-100 d-flex flex-column">
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
      <div>如题所示，用来自动生成页面的模板</div>
      <el-upload
        ref="upload" v-model="fileList" class="upload-demo" :on-exceed="handleExceed" action="#"
        list-type="picture-card" :limit="1" :auto-upload="false"
      >
        <el-icon>
          <Plus />
        </el-icon>

        <template #file="{ file }">
          <div>
            <div class="position-relative">
              <img :src="file.url" class="w-100">
            </div>
            <div class="mt-2">
              <el-button type="primary" size="small" @click="preCropper(file)">
                准备裁剪
              </el-button>
            </div>
          </div>
        </template>
      </el-upload>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.jigsaw-puzzle-page {
  :deep(.upload-demo) {
    .el-upload-list {
      .el-upload-list__item {
        overflow: unset;
        height: auto;
        width: auto;
      }
    }
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    cursor: move;
  }
}
</style>
