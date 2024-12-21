<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
    <div class="border-image-with-radius"></div>
  </div>
</template>
<style lang="scss" scoped>
.greetings {
  .green {
    color: pink;
  }
}
</style>
<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
.border-image-with-radius {
  width: 300px;
  height: 200px;
  position: relative;
  border: 5px solid transparent;
  background: white;
  background-clip: padding-box;
  &::before {
    content: '';
    border-radius: 5px;
    background-image: linear-gradient(red, yellow);
    position: absolute;
    margin: -5px;
    inset: 0;
    z-index: -1;
  }
}
</style>
