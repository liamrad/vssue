<script setup lang="ts">
const props = withDefaults(defineProps<{
  group?: boolean
  tag?: string
}>(), {
  group: false,
  tag: 'div',
})
</script>

<template>
  <component
    :is="props.group ? 'TransitionGroup' : 'Transition'"
    name="fade"
    mode="out-in"
    appear: true
    :tag="props.group ? props.tag : null"
  >
    <slot />
  </component>
</template>
