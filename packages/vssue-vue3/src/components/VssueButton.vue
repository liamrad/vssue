<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: string
  }>(),
  {
    type: 'default',
  },
)
</script>

<template>
  <button
    class="vssue-button"
    :class="`vssue-button-${props.type}`"
  >
    <slot />
  </button>
</template>
