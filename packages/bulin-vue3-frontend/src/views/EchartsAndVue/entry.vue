<script setup>
import BarChartComp from '@/echarts/components/BarChartComp.vue';
import LineChartComp from '@/echarts/components/LineChartComp.vue';
import MosquitoRepellentIncense from '@/echarts/components/MosquitoRepellentIncense.vue';
import { ref } from 'vue';

defineOptions({
  name: 'EchartsAndVue',
});

const lineChartOptions = {
  title: {
    text: '一周气温变化',
  },

  xAxis: {
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    axisLabel: {
      formatter: '{value} °C',
    },
  },
  series: [
    {
      name: 'Highest',
      data: [10, 11, 13, 11, 12, 12, 9],
    },
    {
      name: 'Lowest',
      data: [1, -2, 2, 5, 3, 2, 0],
    },
  ],
};
const mriList = ref([
  {
    value: 90,
    name: '值为90',
    color: ['#3b86ff', '#7aadff'],
  },
  {
    value: 50,
    name: '值为50',
    color: '#36C4F7',
  },
  {
    value: 65,
    name: '值为65',
    color: '#65D4AB',
  },
  {
    value: 40,
    name: '值为40',
    color: '#9FFF8D',
  },
  {
    value: 75,
    name: '值为75',
    color: '#FFE154',
  },

]);
</script>

<template>
  <div class="h-100 d-flex flex-column">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-redpacket_fill" />
          如何使用vue组件来渲染echarts中的tooltip组件？
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container flex-fill d-flex flex-column">
      <div class="plugins-tips">
        如何使用vue组件来渲染echarts中的tooltip组件？
      </div>
      <div class="d-flex flex-fill mt-2  gap-3">
        <div class="flex-fill d-flex gap-3 flex-column flex-basis-0">
          <div class="border border-success flex-fill flex-basis-0 rounded-2 overflow-hidden">
            <LineChartComp :options="lineChartOptions" class="line-chart-comp-wrapper" />
          </div>
          <div class="border border-success flex flex-fill flex-basis-0">
            <BarChartComp class="bar-chart-comp-wrapper" />
          </div>
        </div>
        <div class="flex-fill flex-basis-0 d-flex gap-3">
          <div class="border border-danger rounded-2 flex-fill">
            <MosquitoRepellentIncense :chart-data="mriList" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
