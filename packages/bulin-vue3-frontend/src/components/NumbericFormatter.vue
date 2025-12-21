<script setup lang="ts">
import { computed, ref } from 'vue'
import { numberFormat, isValidNumberic } from '@libc/shared'

const props = defineProps<{
    value: number | string;
    config?: Record<string, unknown>;
    placeholder?: string;
}>();

const percentSign = '%';

const formattedValue = computed(() => {
    if (isValidNumberic(props.value)) {
        let _value = numberFormat(parseFloat(props.value as string), props.config || {});
        if (typeof props.value === 'string' && props.value.endsWith(percentSign)) {
            _value += percentSign;
        }
        return _value;
    }
    return props.placeholder || '-'
});

</script>
<template>
    <div class="numberic-formatter">
        <slot name="suffix"></slot>
        <span>{{ formattedValue }}</span>
    </div>
</template>