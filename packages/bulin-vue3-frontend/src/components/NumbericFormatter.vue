<script setup lang="ts">
import { computed, ref } from 'vue'
import { numberFormat, isFiniteNumber } from '@libc/shared'

const props = defineProps<{
    value: number | string;
    config?: Record<string, unknown>;
    placeholder?: string;
}>();

const percentSign = '%';

const formattedValue = computed(() => {
    if (isFiniteNumber(props.value)) {
        let _value = numberFormat(parseFloat(props.value as string), props.config || {});
        if (typeof props.value === 'string' && props.value.endsWith(percentSign)) {
            _value += percentSign;
        }
        return _value;
    }
    return props.placeholder || '-'
});

const disabledTootip = computed(() => {
    return formattedValue.value === (props.placeholder || '-');
});

</script>
<template>
    <div class="numberic-formatter">
        <slot name="prefix"></slot>
        <el-tooltip :disabled="disabledTootip" :content="value" placement="top">
            <span>{{ formattedValue }}</span>
        </el-tooltip>
        <slot name="suffix"></slot>
    </div>
</template>