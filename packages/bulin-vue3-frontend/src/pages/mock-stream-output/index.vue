<template>
  <div class="mock-stream-output w-100 h-100 d-flex flex-column">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page"></span>
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn"></i>
          模拟流式输出
        </span>
      </div>
    </div>
    <div class="container w-100 h-100 flex-fill">

      <div class=" px-4">
        <div class="d-flex flex-wrap justify-content-between">
          <el-card style="width: 480px" shadow="always">
            <div class="news-item" style="text-indent: 16px;" v-for="(item, index) in newsList" :key="index">{{ item }}
            </div>
          </el-card>
          <el-button type="primary" @click="onStart">开始流式输出</el-button>
          <el-card style="width: 480px" shadow="always">
            <div v-html="content"></div>
          </el-card>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>
import { newsList } from './page'
import { ref, watch } from 'vue'

const msgFragaments = ref([]);
const content = ref('');
let stopWatch = null;

const doWatchFragments = () => {
  stopWatch = watch(() => msgFragaments.value.length, fragmentLengthChange);
}

const streamOutput = (msg) => {
  content.value += `<div class="news-item" style="text-indent: 16px;">`;
  return new Promise((resolve) => {
    const msgArray = msg.split('');
    for (let i = 0; i < msgArray.length; i++) {
      setTimeout(() => {
        content.value += msgArray[i];
        if (i === msgArray.length - 1) {
          content.value += '</div>'; // 添加换行符
          resolve(); // 当最后一个字符输出完成时，resolve
        }
      }, i * 100); // 模拟每个字符输出的延迟
    }

  });
}

const fragmentLengthChange = async () => {
  stopWatch?.();
  const firstFragment = msgFragaments.value.shift();
  await streamOutput(firstFragment);
  if (msgFragaments.value.length) {
    fragmentLengthChange();
  } else {
    doWatchFragments();
  }
}

// 开始流式输出
const onStart = () => {
  content.value = ''; // 清空之前的内容
  stopWatch?.(); // 停止之前的监听
  msgFragaments.value = []; // 清空之前的消息
  doWatchFragments();
  // 模拟流式输出
  newsList.forEach((item, index) => {
    setTimeout(() => {
      msgFragaments.value.push(item);
    }, index * 2000);
  });
}



</script>
<style lang="scss" scoped>
.mock-stream-output {}
</style>
