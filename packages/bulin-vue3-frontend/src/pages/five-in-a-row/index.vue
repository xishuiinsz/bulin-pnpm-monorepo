<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import FirItem from './FirItem.vue';
import pageData, { length } from './page';

const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

const initBoardList = Array.from({ length }).map(() =>
  Array.from({ length }).map(() => null as 'X' | 'O' | null),
) as ('X' | 'O' | null)[][];

const boardList = ref(structuredClone(initBoardList));
const initChess = 'X' as 'X' | 'O';
const data = reactive({
  currentChess: initChess,

});

const cachedData = {
  x: '黑方',
  o: '白方',
};

function winCheck(rowIndex: number, colIndex: number) {
  const directions = [
    { x: 1, y: 0 }, // 横向
    { x: 0, y: 1 }, // 纵向
    { x: 1, y: 1 }, // 主对角线
    { x: 1, y: -1 }, // 副对角线
  ];

  for (const direction of directions) {
    let count = 1;

    // 向正方向检查
    for (let step = 1; step < 5; step++) {
      const newRow = rowIndex + direction.y * step;
      const newCol = colIndex + direction.x * step;
      if (newRow < 0 || newRow >= length || newCol < 0 || newCol >= length)
        break;
      if (boardList.value[newRow][newCol] === data.currentChess) {
        count++;
      }
      else {
        break;
      }
    }

    // 向反方向检查
    for (let step = 1; step < 5; step++) {
      const newRow = rowIndex - direction.y * step;
      const newCol = colIndex - direction.x * step;
      if (newRow < 0 || newRow >= length || newCol < 0 || newCol >= length)
        break;
      if (boardList.value[newRow][newCol] === data.currentChess) {
        count++;
      }
      else {
        break;
      }
    }
    if (count >= 5) {
      ElMessage.success(`${cachedData[(data.currentChess).toLowerCase()]} 赢了!`);
      boardList.value = structuredClone(initBoardList);
      data.currentChess = initChess;
      return true;
    }
  }
  return false;
}

function handleClick(props: { rowIndex: number; colIndex: number }) {
  boardList.value[props.rowIndex][props.colIndex] = data.currentChess;
  if (winCheck(props.rowIndex, props.colIndex)) {
    return;
  }
  data.currentChess = data.currentChess === 'X' ? 'O' : 'X';
}
</script>

<template>
  <div class="auto-generate-page w-100 h-100 d-flex flex-column" :class="rootClass">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          {{ pageData.title }}
        </span>
      </div>
    </div>
    <div class="container  w-100 h-100 flex-fill">
      <div class="d-flex gap-4">
        <div
          class="d-grid fir-board"
          :style="`grid-template-columns: repeat(${length}, 30px); grid-template-rows: repeat(${length}, 30px);`"
        >
          <template v-for="(item, rowIndex) in boardList" :key="rowIndex">
            <template v-for="(subItem, colIndex) in item" :key="colIndex">
              <FirItem :row-index="rowIndex" :col-index="colIndex" :value="subItem" @click-trigger="handleClick" />
            </template>
          </template>
        </div>
        <div class="chess-replay p-3">
          <div class="w-100">
            <div class="text-center">
              当前下棋方:
            </div>
            <div class="w-100 position-relative" style="height: 2rem;">
              <div class="chess-piece" :class="`chess-piece-${data.currentChess.toLowerCase()}`" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auto-generate-page {
  :deep(.chess-piece) {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    z-index: 10;
    border-radius: 50%;

    &.chess-piece-empty {
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    &.chess-piece-x {
      background-color: black;
    }

    &.chess-piece-o {
      background-color: white;
    }

  }

  .chess-replay {
    background-color: bisque;
  }
}
</style>
