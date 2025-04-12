<script setup lang="ts">
import { useEcharts } from '@/echarts/index';
import { computed } from 'vue';

const props = defineProps<{
  chartData: Array<{
    value: number;
    name: string;
    color: string;
  }>;
}>();

const maxRadius = 60;
const barWidth = 4;
const barGap = 4;

const computedOptions = computed(() => {
  const series = [];
  if (props.chartData.length) {
    props.chartData.forEach((item, i) => {
      series.push({
        type: 'pie',
        clockWise: true, // 顺时加载
        hoverAnimation: false, // 鼠标移入变大
        radius: [`${maxRadius - i * (barGap + barWidth)}%`, `${maxRadius - (i + 1) * barWidth - i * barGap}%`],
        center: ['50%', '50%'],
        label: {
          show: false,
        },
        itemStyle: {
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          borderWidth: 5,
          borderRadius: 10,
        },
        data: [{
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        }, {
          value: 100 - item.value,
          name: '',
          itemStyle: {
            color: 'transparent',
          },
          tooltip: {
            show: false,
          },
          hoverAnimation: false,
        }],
      });
      series.push({
        name: 'blank',
        type: 'pie',
        silent: true,
        z: 0,
        clockWise: false, // 顺时加载
        hoverAnimation: false, // 鼠标移入变大
        radius: [`${maxRadius - i * (barGap + barWidth)}%`, `${maxRadius - (i + 1) * barWidth - i * barGap}%`],
        center: ['50%', '50%'],
        label: {
          show: false,
        },
        itemStyle: {
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          borderWidth: 5,
        },
        data: [{
          value: 1,
          itemStyle: {
            color: '#f7f7f7', // 圆圈另一半的颜色
            borderWidth: 0,
          },
          tooltip: {
            show: false,
          },
          hoverAnimation: false,
        }],
      });
    });
  }

  const options = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    backgroundColor: '#fff',
    tooltip: {
      show: true,
      trigger: 'item',
    },
    series,
  };
  return options;
});

const { chartRef } = useEcharts(computedOptions);
</script>

<template>
  <div class="w-100 h-100 p-4">
    <div class="w-100 h-100 d-flex align-items-center">
      <div ref="chartRef" class="w-75 h-100 flex-fill" />
      <div class="w-25 ">
        <div v-for="item in chartData" :key="item.name" class="d-flex align-items-center mb-2">
          <span class=" text-nowrap">{{ item.name }}</span>
          <span class=" ms-2">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
