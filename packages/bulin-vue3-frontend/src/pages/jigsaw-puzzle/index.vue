<script setup lang="ts">
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { genFileId } from 'element-plus';
import Sortable from 'sortablejs';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData from './page';

const upload = ref<UploadInstance>();
const fileList = ref<File[]>([]);

const color = '#358aff';

const imgsList = ref<{ img: string; sort: number }[]>([]);

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const cachedData = {
  canvas: null as HTMLCanvasElement | null,
  rectBox: null as Path2D | null,
  flagMouseDown: false,
  rectConfig: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
};

function mousemoveEvent(event: MouseEvent) {
  event.preventDefault();
  if (!cachedData.canvas) {
    return;
  }
  if (cachedData.flagMouseDown === true) {
    cachedData.canvas.style.cursor = 'move';
    const { rectConfig } = cachedData;
    if (rectConfig.x <= 0) {
      rectConfig.x = 0;
    }
    if (rectConfig.x + rectConfig.width >= cachedData.canvas.width) {
      rectConfig.x = cachedData.canvas.width - rectConfig.width;
    }
    if (rectConfig.y <= 0) {
      rectConfig.y = 0;
    }
    if (rectConfig.y + rectConfig.height >= cachedData.canvas.height) {
      rectConfig.y = cachedData.canvas.height - rectConfig.height;
    }
    const { movementX, movementY } = event;

    rectConfig.x += movementX;
    rectConfig.y += movementY;
    drawRect();
  }
  else {
    const { offsetX, offsetY } = event;
    const ctx = cachedData.canvas.getContext('2d');
    const result = ctx.isPointInPath(cachedData.rectBox, offsetX, offsetY);
    if (result) {
      cachedData.canvas.style.cursor = 'grab';
    }
    else {
      cachedData.canvas.style.cursor = 'default';
    }
  }
}

function mouseupEvent(event: MouseEvent) {
  event.preventDefault();
  if (!cachedData.canvas) {
    return;
  }
  cachedData.flagMouseDown = false;
  cachedData.canvas.removeEventListener('mouseup', mouseupEvent);
}

function mousedownEvent(event: MouseEvent) {
  event.preventDefault();
  if (!cachedData.canvas) {
    return;
  }

  const { offsetX, offsetY } = event;
  const ctx = cachedData.canvas.getContext('2d');
  const result = ctx.isPointInPath(cachedData.rectBox, offsetX, offsetY);
  if (!result) {
    return;
  }
  cachedData.flagMouseDown = true;
  window.addEventListener('mouseup', mouseupEvent);
}

function handleChange() {
  imgsList.value = [];
}

function preCropper(file: File) {
  const container = upload.value?.$el as HTMLElement;
  const img = container.querySelector('img') as HTMLImageElement;
  if (!img) {
    return;
  }
  const { naturalWidth: imgWidth, naturalHeight: imgHeight } = img;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  const nineSquareGrid = container.querySelector('.nine-square-grid') as HTMLElement;
  const { offsetLeft: offsetLeftGrid, offsetTop: offsetTopGrid } = nineSquareGrid;
  const nineSquareGridItems = nineSquareGrid.querySelectorAll('.nine-square-item');
  nineSquareGridItems.forEach((item, index) => {
    const { offsetLeft, offsetTop, offsetWidth: width, offsetHeight: height } = item as HTMLElement;
    const data = ctx.getImageData(offsetLeft + offsetLeftGrid, offsetTop + offsetTopGrid, width, height);
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    const newCtx = newCanvas.getContext('2d');
    newCtx.putImageData(data, 0, 0);
    const newDataUrl = newCanvas.toDataURL('image/png');
    const imgData = { img: newDataUrl, sort: index };
    imgsList.value.push(imgData);
  });
}

let sortableInstance: Sortable | null = null;

function randomSort() {
  imgsList.value.sort(() => Math.random() - 0.5);
  if (!sortableInstance) {
    const el = document.querySelector('.d-grid') as HTMLElement;
    sortableInstance = Sortable.create(el, {
      animation: 150,
      onEnd(evt) {
        const { oldIndex, newIndex } = evt;
        const [item] = imgsList.value.splice(oldIndex!, 1);
        imgsList.value.splice(newIndex!, 0, item);
      },
    });
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
        ref="upload" v-model="fileList" class="upload-demo mt-2" :on-exceed="handleExceed" action="#"
        list-type="picture-card" :limit="1" :auto-upload="false" @change="handleChange"
      >
        <el-icon>
          <Plus />
        </el-icon>

        <template #file="{ file }">
          <div v-if="!imgsList.length">
            <div class="position-relative">
              <img :src="file.url" class="w-100">
              <div class="nine-square-grid-container w-100 h-100 position-absolute top-0 start-0">
                <div class="nine-square-grid">
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                  <div class="nine-square-item h-100" />
                </div>
              </div>
            </div>
            <div class="mt-2">
              <el-button type="primary" size="small" @click="preCropper(file)">
                准备裁剪
              </el-button>
            </div>
          </div>
          <div v-else>
            <div class="d-grid puzzle-container" style="grid-template-columns: repeat(3, 1fr); gap: 2px;">
              <div v-for="(item, sort) in imgsList" :key="sort">
                <img :src="item.img">
              </div>
            </div>
            <div class="mt-2">
              <el-button type="primary" size="small" @click="randomSort">
                随机更换顺序
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

  $square-container: 80%;

  .nine-square-grid-container {
    .nine-square-grid {
      position: absolute;
      left: calc((100% - #{$square-container}) / 2);
      top: calc((100% - #{$square-container}) / 2);
      width: $square-container;
      height: $square-container;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);

      .nine-square-item {
        border: 1px solid #fff;
      }
    }
  }

}
</style>
