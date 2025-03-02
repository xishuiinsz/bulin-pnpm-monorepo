<script setup>
import { computed, watch } from 'vue';
import useSemiCircle from './useSemiCircle';

const props = defineProps({
  value: {
    type: [String, Number],
    default: 0,
  },
});
useSemiCircle(computed(() => props.value));
</script>

<template>
  <canvas class="w-100 h-100" />
</template>
