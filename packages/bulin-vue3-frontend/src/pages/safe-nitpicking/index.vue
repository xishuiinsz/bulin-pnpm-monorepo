<script setup lang="ts">
import showUpload from '@/imperatives/showUpload';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, genFileId } from 'element-plus';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData, { rootClass } from './page';

const activeStep = ref(0);
const imgUrl = ref('');
const shapes = [];
const cachedData = { img: null, canvas: null, instanceofElMessage: null };

function uploadImage() {
  const config = {
    onchange: (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0] as File;
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片格式文件');
        return;
      }
      shapes.length = 0;
      cachedData.canvas?.remove?.();
      cachedData.canvas = null;
      const url = URL.createObjectURL(file);
      imgUrl.value = url;
      ElMessage.success('图片上传成功');
      activeStep.value = 1;
    },
  };
  showUpload(config);
}

function drawImage(img) {
  if (img instanceof HTMLImageElement) {
    const { offsetWidth, offsetHeight } = img;
    const canvas = document.createElement('canvas');
    canvas.className = 'position-absolute top-0 start-0';
    img.parentElement?.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = offsetWidth;
    canvas.height = offsetHeight;
    ctx.drawImage(img, 0, 0, offsetWidth, offsetHeight);
    return canvas;
  }
  return null;
}

function mousedownEvt(e) {
  if (cachedData.canvas) {
    const { canvas } = cachedData;
    const ctx = canvas.getContext('2d');
    const paths = new Path2D();
    const mousemoveEvt = (ev) => {
      paths.lineTo(ev.offsetX, ev.offsetY);
      ctx.stroke(paths);
    };
    const mouseUpEvt = (ev) => {
      ctx.closePath();
      shapes.push(paths);
      canvas.removeEventListener('mousemove', mousemoveEvt);
      window.removeEventListener('mouseup', mouseUpEvt);
    };
    canvas.addEventListener('mousemove', mousemoveEvt);
    window.addEventListener('mouseup', mouseUpEvt);
    ctx.beginPath();
    paths.moveTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = 'red';
  }
}

function startFinding() {
  if (!cachedData.canvas) {
    ElMessage.error('请先上传图片');
    return;
  }
  if (!shapes.length) {
    ElMessage.error('请先设置找茬点');
    return;
  }
  const { canvas } = cachedData;
  canvas.removeEventListener('mousedown', mousedownEvt);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (shapes.length) {
    shapes.forEach((paths) => {
      ctx.strokeStyle = 'transparent';
      ctx.stroke(paths);
    });
    const handleClick = (event: MouseEvent) => {
      const { offsetX, offsetY } = event;
      if (cachedData.instanceofElMessage) {
        const { instanceofElMessage } = cachedData;
        instanceofElMessage?.close();
      }
      shapes.forEach((paths, index) => {
        if (ctx.isPointInPath(paths, offsetX, offsetY)) {
          cachedData.instanceofElMessage = ElMessage.success('找茬成功');
          ctx.strokeStyle = 'red';
          ctx.stroke(paths);
          shapes.splice(index, 1);
        }
      });
    };
    canvas.addEventListener('click', handleClick);
  }
}

function onImageLoad(event) {
  if (event.target instanceof HTMLImageElement) {
    const img = event.target as HTMLImageElement;
    const canvas = drawImage(img);
    Object.assign(cachedData, { img, canvas });

    canvas.addEventListener('mousedown', mousedownEvt);
  }
}
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
    <div class="container w-100 h-100 flex-fill overflow-hidden">
      <div>消防安全、交通安全、高空安全、水域安全找茬</div>
      <div class="h-75 d-flex mt-5 gap-4">
        <el-steps class="fs14" direction="vertical" :active="activeStep" finish-status="success">
          <el-step title="上传图片">
            <template #title>
              <el-button class="cursor-pointer" @click="uploadImage">
                <el-icon>
                  <Plus />
                </el-icon>
                上传图片
              </el-button>
            </template>
          </el-step>

          <el-step title="开始找茬">
            <template #title>
              <el-button class="cursor-pointer" @click="startFinding">
                开始找茬
              </el-button>
            </template>
          </el-step>
        </el-steps>
        <div class="flex-fill position-relative">
          <img :src="imgUrl" alt="" class="h-100" @load="onImageLoad">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.safe-nitpicking {}
</style>
