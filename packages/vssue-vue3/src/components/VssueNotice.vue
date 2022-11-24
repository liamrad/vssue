<script setup lang="ts">
import { inject, onBeforeUnmount, reactive, watch } from 'vue'
import type { Vssue } from '../../types'
import TransitionFade from './TransitionFade.vue'

const vssue: Vssue.Store = inject('vssue') as Vssue.Store

const progress = reactive<{
  show: boolean
  percent: number
  timer: number | null
  speed: number
}>({
  show: false,
  percent: 0,
  timer: null,
  speed: 200,
})

const alert = reactive<{
  show: boolean
  message: string | null
  timer: number | null
}>({
  show: false,
  message: null,
  timer: null,
})

const progressStart = () => {
  progress.show = true
  progress.percent = 0
  progress.timer = window.setInterval(() => {
    progress.percent += 5
    if (progress.percent > 94 && progress.timer !== null)
      window.clearInterval(progress.timer)
  }, progress.speed)
}

const progressDone = () => {
  progress.percent = 100
  if (progress.timer !== null)
    window.clearTimeout(progress.timer)
  progress.timer = null
  window.setTimeout(() => {
    progress.show = false
  }, progress.speed)
}

const alertHide = () => {
  alert.show = false
  if (alert.timer !== null)
    window.clearTimeout(alert.timer)
  alert.timer = null
}

const alertShow = (content: string) => {
  alert.show = true
  alert.message = content
  if (alert.timer !== null)
    window.clearTimeout(alert.timer)
  alert.timer = window.setTimeout(() => {
    alertHide()
  }, 3000)
}

// TODO
// vssue.$on('error', (e: any) => alertShow(e.message))

// onBeforeUnmount(() => {
//   vssue.$off('error')
//   if (progress.timer !== null)
//     window.clearTimeout(progress.timer)
//   if (alert.timer !== null)
//     window.clearTimeout(alert.timer)
// })

watch(() => vssue.VssueState.isLoadingComments, (val: boolean) => {
  if (vssue.VssueState.comments) {
    if (val)
      progressStart()
    else
      progressDone()
  }
})
</script>

<template>
  <div class="vssue-notice">
    <div
      v-show="progress.show"
      class="vssue-progress"
      :style="{
        width: `${progress.percent}%`,
        transition: `all ${progress.speed}ms linear`,
      }"
    />

    <TransitionFade>
      <div
        v-show="alert.show"
        class="vssue-alert"
        @click="alertHide()"
        v-text="alert.message"
      />
    </TransitionFade>
  </div>
</template>
