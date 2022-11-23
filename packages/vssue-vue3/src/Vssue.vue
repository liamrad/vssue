<script setup lang="ts">
import { onMounted, provide, watch } from 'vue'
import type { Vssue as VssueNamespace } from '../types'

import Iconfont from './components/Iconfont.vue'
import VssueBody from './components/VssueBody.vue'
import VssueHeader from './components/VssueHeader.vue'

import { useVssueStore } from './VssueStore'

const props = withDefaults(defineProps<{
  title?: string | ((opts?: VssueNamespace.Options) => string) | null
  issueId?: string | number | null
  options?: Partial<VssueNamespace.Options>
}>(), {
  title: 'Vssue',
  issueId: null,
  options: () => ({}),
})

const vssue = useVssueStore()

provide('vssue', vssue)

onMounted(() => {
  // set issue title and issue id
  if (props.title !== null)
    vssue.VssueState.title = props.title

  if (props.issueId !== null)
    vssue.VssueState.issueId = props.issueId

  // set options
  vssue.setOptions(props.options)

  // init vssue
  vssue.init()
})

watch(() => props.options, () => {
  vssue.setOptions(props.options)
}, { deep: true })
</script>

<template>
  <div class="vssue">
    <!-- iconfont -->
    <Iconfont />

    <!-- header -->
    <VssueHeader />

    <!-- body -->
    <VssueBody />
  </div>
</template>
