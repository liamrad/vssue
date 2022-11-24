<script setup lang="ts">
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Vssue } from '../../types'
import TransitionFade from './TransitionFade.vue'
import VssueIcon from './VssueIcon.vue'

const { t } = useI18n()

const vssue: Vssue.Store = inject('vssue') as Vssue.Store

const status = computed((): string | null => {
  // console.log()
  if (vssue.VssueState.isFailed) {
    return 'failed'
  }
  else if (vssue.VssueState.isInitializing) {
    return 'initializing'
  }
  else if (vssue.VssueState.isIssueNotCreated && !vssue.VssueState.isCreatingIssue) {
    if (vssue.isAdmin.value || !vssue.isLogined.value)
      return 'issueNotCreated'
    else
      return 'failed'
  }
  else if (vssue.VssueState.isLoginRequired) {
    return 'loginRequired'
  }
  else if (!vssue.VssueState.comments || vssue.VssueState.isCreatingIssue) {
    return 'loadingComments'
  }
  else if (vssue.VssueState.comments.data.length === 0) {
    return 'noComments'
  }
  else {
    return null
  }
})

const handleClick = (): void => {
  if (status.value === 'issueNotCreated')
    vssue.postIssue()
  else if (status.value === 'loginRequired')
    vssue.login()
}
</script>

<template>
  <TransitionFade>
    <div v-if="status" :key="status" class="vssue-status">
      <VssueIcon
        v-if="['failed', 'loadingComments', 'initializing'].includes(status)"
        :name="status === 'failed' ? 'error' : 'loading'"
      />

      <p class="vssue-status-info">
        <Component
          :is="
            ['issueNotCreated', 'loginRequired'].includes(status) ? 'a' : 'span'
          "
          @click="handleClick"
        >
          {{ t(status) }}
        </Component>
      </p>
    </div>
  </TransitionFade>
</template>
