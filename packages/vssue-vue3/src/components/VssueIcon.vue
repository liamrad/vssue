<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  title?: string
}>(), {
  title: '',
})
</script>

<template>
  <svg
    aria-hidden
    class="vssue-icon"
    :class="`vssue-icon-${props.name}`"
  >
    <title>{{ props.title }}</title>
    <use :xlink:href="`#vssue-icon-${props.name}`" />
  </svg>
</template>
