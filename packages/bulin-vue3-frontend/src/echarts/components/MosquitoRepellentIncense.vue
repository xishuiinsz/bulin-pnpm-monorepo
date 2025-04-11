<script setup lang="ts">
import { useEcharts } from '@/echarts/index';
import { computed, reactive } from 'vue';

const maxRadius = 60;
const barWidth = 4;
const barGap = 4;
const barColor = [
  {
    color1: '#4E9DFF',
    color2: '',
  },
  {
    color1: '#36C4F7',
    color2: '',
  },
  {
    color1: '#65D4AB',
    color2: '',
  },
  {
    color1: '#9FFF8D',
    color2: '',
  },
  {
    color1: '#FFE154',
    color2: '',
  },
  {
    color1: '#FFB854',
    color2: '',
  },
  {
    color1: '#FF9254',
    color2: '',
  },
  {
    color1: '#FF8181',
    color2: '',
  },
  {
    color1: '#FF81BA',
    color2: '',
  },
  {
    color1: '#DC81FF',
    color2: '',
  },
];
const pieDatas = [
  {
    value: 20,
    name: '值为20',
  },
  {
    value: 50,
    name: '值为50',
  },
  {
    value: 65,
    name: '值为65',
  },
  {
    value: 40,
    name: '值为40',
  },
  {
    value: 75,
    name: '值为75',
  },

];
const series = reactive([]);
console.log(series);

pieDatas.forEach((item, i) => {
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
        color: barColor[i].color1,
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

const computingOptions = computed(() => {
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

const { chartRef } = useEcharts(computingOptions);
</script>

<template>
  <div class="w-100 h-100 p-4">
    <div class="w-100 h-100 d-flex align-items-center gap-3">
      <div ref="chartRef" class="w-100 h-100 flex-fill" />
      <div>
        <div v-for="item in pieDatas" :key="item.name" class="d-flex align-items-center mb-2">
          <span class=" text-nowrap">{{ item.name }}</span>
          <span class=" ms-2">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
