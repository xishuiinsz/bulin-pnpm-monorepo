<template>
  <v-header />
  <router-view />
</template>

<script setup>
import vHeader from '@/components/Header.vue'
</script>

<style lang="scss">
@use './assets/css/main.css';
@use './assets/css/color-dark.css';
@use './assets/css/index.scss';
</style>
