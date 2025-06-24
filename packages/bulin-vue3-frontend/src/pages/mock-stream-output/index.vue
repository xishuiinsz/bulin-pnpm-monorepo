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

      <div class=" px-4 h-100">
        <div class="d-flex flex-wrap h-100 justify-content-between">
          <el-card style="width: 480px" shadow="always">
            <div class="news-item" style="text-indent: 16px;" v-for="(item, index) in newsList" :key="index">{{ item }}
            </div>
          </el-card>
          <div class="d-flex flex-column gap-4 align-items-center">
            <el-button type="primary" @click="onStart">开始流式输出</el-button>
            <el-button type="primary" @click="randomOutput">随机字符流式输出</el-button>
          </div>

          <el-card body-class="h-100" class="h-100 py-4" style="width: 480px;--el-card-padding:0;" shadow="always">
            <div class="scroll-container hidden-y-scrollbar px-4 h-100 overflow-y-auto">
              <div class="response-content word-break-all" v-html="content"></div>
            </div>

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
let timer = null;

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

const randomOutput = () => {
  content.value = ''; // 清空之前的内容
  clearTimeout(timer); // 清除之前的定时器
  function generateRandomChineseChars(count) {
    // 常用汉字范围（GB2312 一级字库 3755 个）
    const start = 0x4E00;  // 汉字起始 Unicode（一）
    const end = 0x9FA5;    // 汉字结束 Unicode（龥）

    let result = '';
    for (let i = 0; i < count; i++) {
      // 生成随机汉字 Unicode 码点（常用汉字区）
      const unicode = Math.floor(Math.random() * (end - start + 1)) + start;
      // 将 Unicode 码点转换为汉字字符
      result += String.fromCodePoint(unicode);
    }
    return result;
  }
  const thinkTags = ['<think>', '</think>'];
  let times = 200;
  const interval = 100;
  const loopFunc = () => {
    timer = setTimeout(() => {
      content.value += generateRandomChineseChars(4);
      times--;
      if (times === 100 && content.value.startsWith(thinkTags[0])) {
        content.value += thinkTags[1];
        content.value += '<br/>';
      }
      if (times) {
        loopFunc();
      }
    }, interval);

  }
  if (Math.random() > 0.5) {
    content.value += thinkTags[0];
  }
  loopFunc()
}



</script>
<style lang="scss" scoped>
.mock-stream-output {
  .hidden-y-scrollbar {
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .response-content {
    :deep(think) {
      color: #409eff;
      font-weight: bold;
    }
  }
}
</style>
