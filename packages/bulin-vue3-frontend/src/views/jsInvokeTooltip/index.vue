<script setup>
import DynamicTooltip from '@/components/DynamicTooltip.vue';
import showTooltip from '@/imperatives/showTooltip';

function setZoom(value, element = document.body) {
  Object.assign(element.style, { zoom: value });
}
</script>

<template>
  <div class="content-editable-container">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          js调用tooltip
        </span>
        <span class="el-breadcrumb__separator" role="presentation">/</span>
      </div>
    </div>
    <div class="container">
      <h1>js如何调用ElTooltip组件</h1>
      <div
        style="max-width: 200px" class="text-nowrap overflow-hidden text-truncate"
        @mouseenter="showTooltip($event.target, { effect: 'light' })"
      >
        超长文本超长文本超长文本超长文本超长文本超长文本
      </div>
      <el-divider border-style="dashed" />
      <h1>DynamicTooltip组件</h1>
      <DynamicTooltip>
        <div style="max-width: 200px;outline: 1px solid green;" class="text-nowrap overflow-hidden text-truncate">
          超长文本超长文本超长文本超长文本超长文本超长文本
        </div>
      </DynamicTooltip>

      <el-divider border-style="dashed" />
      <h1>原生ElTooltip组件</h1>
      <el-tooltip content="超长文本超长文本超长文本超长文本超长文本超长文本">
        <div style="max-width: 200px;outline: 1px solid green;" class="text-nowrap overflow-hidden text-truncate">
          超长文本超长文本超长文本超长文本超长文本超长文本
        </div>
      </el-tooltip>
      <h1 class="mt-4">
        设置不同的zoom
      </h1>
      <div>
        <el-button type="primary" @click="setZoom(0.75)">
          0.75倍zoom
        </el-button>
        <el-button type="primary" @click="setZoom(1)">
          恢复zoom
        </el-button>
        <el-button type="primary" @click="setZoom(1.25)">
          1.25倍zoom
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-editable-container {
  .multi-editable-form {
    width: 400px;
  }

  .div-content-editable {
    width: 100%;
    height: 32px;
    background-color: pink;
  }
}
</style>
