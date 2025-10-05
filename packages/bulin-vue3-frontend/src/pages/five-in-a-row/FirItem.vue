<script setup lang="ts">
import { onMounted } from 'vue';
import { length } from './page';

const props = defineProps<{
  rowIndex: number;
  colIndex: number;
  value: null | 'X' | 'O';
}>();

const emit = defineEmits<{
  (e: 'clickTrigger', props: { rowIndex: number; colIndex: number }): void;
}>();

function handleClick(props: { rowIndex: number; colIndex: number; value: null | 'X' | 'O' }) {
  if (props.value) {
    return;
  }
  emit('clickTrigger', props);
}
</script>

<template>
  <div
    :class="{ 'first-row': rowIndex === 0, 'last-row': rowIndex === length - 1, 'first-col': colIndex === 0, 'last-col': colIndex === length - 1 }"
    class="fir-item lh-1 text-center"
  >
    <div class="chess-piece cursor-pointer" :class="value && `chess-piece-${value}`" @click="handleClick(props)">
      {{ value ? value : '' }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fir-item {
  width: 30px;
  height: 30px;
  box-sizing: border-box;
  position: relative;
  background-color: bisque;
  place-content: center;

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-color: #fff;
  }

  &::after {
    content: '';
    display: block;
    width: 1px;
    height: 100%;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
  }

  &.first-row {
    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 50%;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      background-color: #fff;
    }
  }

  &.last-row {
    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 50%;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      background-color: #fff;
    }
  }

  &.first-col {
    &::before {
      content: '';
      display: block;
      width: 50%;
      height: 1px;
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background-color: #fff;
    }
  }

  &.last-col {
    &::before {
      content: '';
      display: block;
      width: 50%;
      height: 1px;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      background-color: #fff;
    }
  }

  .chess-piece {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    z-index: 10;
    border-radius: 50%;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
