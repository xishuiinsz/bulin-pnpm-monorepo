<script setup lang="ts">
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, genFileId } from 'element-plus';
import Sortable from 'sortablejs';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData from './page';

const upload = ref<UploadInstance>();
const fileList = ref<File[]>([]);
const isDisableCheck = ref(true);

let sortableInstance: Sortable | null = null;

const imgsList = ref<{ img: string; sort: number }[]>([]);

const handleExceed: UploadProps['onExceed'] = (files) => {
  imgsList.value = [];
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

// 本地缓存数据
const cachedData = {
  firstTime: null,
  endTime: null,
  hasRegMousemoveEvent: false,
  flagMouseDown: false,
};

function getNineSquareGrid() {
  const container = upload.value?.$el as HTMLElement;
  const nineSquareGrid = container.querySelector('.nine-square-grid') as HTMLElement;
  return nineSquareGrid;
}

function mousemoveEvent(event: MouseEvent) {
  event.preventDefault();
  const nineSquareGrid = getNineSquareGrid();
  if (cachedData.flagMouseDown === true) {
    if (nineSquareGrid) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = nineSquareGrid;
      const { offsetWidth: containerWidth, offsetHeight: containerHeight } = nineSquareGrid.parentElement;
      nineSquareGrid.style.cursor = 'move';
      const { movementX, movementY } = event;
      const x = offsetLeft + movementX;
      const y = offsetTop + movementY;
      if (x < 0 || y < 0) {
        return;
      }
      if (x + offsetWidth > containerWidth || y + offsetHeight > containerHeight) {
        return;
      }
      nineSquareGrid.style.left = `${x}px`;
      nineSquareGrid.style.top = `${y}px`;
    }
  }
  else {
    if (!cachedData.hasRegMousemoveEvent) {
      nineSquareGrid.addEventListener('mousedown', mousedownEvent, { capture: true });
      cachedData.hasRegMousemoveEvent = true;
    }
  }
}

function mouseupEvent(event: MouseEvent) {
  event.preventDefault();
  cachedData.flagMouseDown = false;
  cachedData.hasRegMousemoveEvent = false;
  const nineSquareGrid = getNineSquareGrid();
  if (nineSquareGrid) {
    nineSquareGrid.style.cursor = 'default';
    nineSquareGrid.removeEventListener('mouseup', mouseupEvent);
    nineSquareGrid.removeEventListener('mousemove', mousemoveEvent);
  }
}

function mousedownEvent(event: MouseEvent) {
  event.preventDefault();
  cachedData.flagMouseDown = true;
  window.addEventListener('mouseup', mouseupEvent);
}

function regMousemoveEvent() {
  const container = upload.value?.$el as HTMLElement;
  if (container) {
    container.addEventListener('mousemove', mousemoveEvent);
  }
}

function onChange() {
  cachedData.hasRegMousemoveEvent = false;
  cachedData.flagMouseDown = false;
  regMousemoveEvent();
}

function preCropper(file: File) {
  const container = upload.value?.$el as HTMLElement;
  const img = container.querySelector('img') as HTMLImageElement;
  if (!img) {
    return;
  }
  const { offsetWidth: imgWidth, offsetHeight: imgHeight } = img;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  const nineSquareGrid = container.querySelector('.nine-square-grid') as HTMLElement;
  if (!nineSquareGrid) {
    return;
  }
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
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
  nineSquareGrid.addEventListener('mousedown', mousedownEvent, { capture: true });
  nineSquareGrid.addEventListener('mousemove', mousemoveEvent);
}

function randomSort() {
  imgsList.value.sort(() => Math.random() - 0.5);
  Object.assign(cachedData, { firstTime: null, endTime: null });
  if (!sortableInstance) {
    const container = document.querySelector('.puzzle-container') as HTMLElement;
    sortableInstance = Sortable.create(container, {
      animation: 150,
      onEnd(evt) {
        if (!cachedData.firstTime) {
          Object.assign(cachedData, { firstTime: new Date().getTime() });
        }
        const { oldIndex, newIndex } = evt;
        if (oldIndex === newIndex) {
          return;
        }
        isDisableCheck.value = false;
        const [item] = imgsList.value.splice(oldIndex!, 1);
        imgsList.value.splice(newIndex!, 0, item);
      },
    });
  }
}

function resetSort() {
  imgsList.value.sort((a, b) => a.sort - b.sort);
}

function checkPuzzle() {
  isDisableCheck.value = true;
  for (let index = 0; index < imgsList.value.length; index++) {
    const element = imgsList.value[index];
    if (element.sort !== index) {
      ElMessage.error('拼图失败');
      return;
    }
  }
  if (!cachedData.endTime) {
    Object.assign(cachedData, { endTime: new Date().getTime() });
  }
  const diffTime = ((cachedData.endTime - cachedData.firstTime) / 1000).toFixed(2);
  if (diffTime) {
    ElMessage.success(`拼图成功，耗时${diffTime}秒`);
  }
  else {
    ElMessage.success('拼图成功');
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
        accept="image/*" list-type="picture-card" :limit="1" :auto-upload="false" :on-change="onChange"
      >
        <el-icon>
          <Plus />
        </el-icon>

        <template #file="{ file }">
          <div v-if="!imgsList.length">
            <div class="position-relative">
              <img
                :src="file.url" class="w-100"
                style="max-height: calc(100vh - 15rem );max-width: calc(100vw - 10rem);"
              >
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
              <div v-for="(item) in imgsList" :key="item.sort" :data-sort="item.sort">
                <img :src="item.img">
              </div>
            </div>
            <div class="mt-2">
              <el-button type="primary" size="small" @click="randomSort">
                随机顺序
              </el-button>
              <el-button type="primary" size="small" @click="resetSort">
                重置顺序
              </el-button>
              <el-button :disabled="isDisableCheck" type="primary" size="small" @click="checkPuzzle">
                检测是否成功
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
    max-width: 50vw;

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
