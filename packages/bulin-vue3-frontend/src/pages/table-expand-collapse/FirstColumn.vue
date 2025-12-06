<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue';
import { onMounted, ref, getCurrentInstance, computed, nextTick } from 'vue';
const { data } = defineProps<{ data: any }>();

const instance = getCurrentInstance();
const rowSpan = ref(1);
const rowHeight = 40;

const flag = ref(true);

const height = computed(() => {
  return rowSpan.value * rowHeight + 'px';
});

const init = () => {
  const container = instance?.proxy?.$el;
  const td = container?.closest('td');
  if (td) {
    rowSpan.value = td.rowSpan;
    const computing = () => {
      flag.value = container.offsetHeight >= container.scrollHeight;
    };
    nextTick(computing);
  }
};

onMounted(init);
</script>
<template>
    <div class="first-column" :style="{ height: height }">
        <el-tooltip  :disabled="flag" :content="data.name" placement="top">
            <el-icon size="24">
                <Setting />
            </el-icon>
        </el-tooltip>
        <div v-if="flag" class="name-wrapper w-100 mt-2">{{ data.name }}</div>
    </div>
</template>
<style lang='scss' scoped>
.first-column {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column ;
    align-items: center ;
    justify-content: center;
}
</style>