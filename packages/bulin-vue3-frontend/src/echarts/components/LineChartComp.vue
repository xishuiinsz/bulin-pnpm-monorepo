<script setup>
import echarts, { instanceInterceptor, useEcharts } from '@/echarts/index';
import { merge } from 'lodash';
import { createApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import MyTooltip from '../MyTooltip.vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => {},
  },
  customer: {
    type: Function,
    default: null,
  },
});
async function myTooltipFormatter(params) {
  const htmlTemplate = await renderToString(createApp(MyTooltip, { list: params }));
  return htmlTemplate;
}
const defaultOption = {
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} 个',
    },
  },
  grid: { bottom: 24, containLabel: true, left: 24 },
  series: [{ type: 'line' }, { type: 'line' }, { type: 'line' }],
};

if (typeof props.customer === 'function') {
  props.customer(structuredClone(defaultOption));
}

const mergedOptins = merge(structuredClone(defaultOption), props.options);
const { chartRef } = useEcharts(mergedOptins);
</script>

<script>
export default {
  name: 'EchartsAndVue',
};
</script>

<template>
  <div ref="chartRef" class="flex-fill h-100 line-bar" />
</template>

<style></style>
