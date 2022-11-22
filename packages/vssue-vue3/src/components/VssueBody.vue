<script setup lang="ts">
import { inject } from 'vue'
import type { Vssue } from '../../types'
import TransitionFade from './TransitionFade.vue'
import VssueIcon from './VssueIcon.vue'
import VssueComments from './VssueComments.vue'
import VssueNewComment from './VssueNewComment.vue'
import VssueNotice from './VssueNotice.vue'
import VssueStatus from './VssueStatus.vue'

const vssue: Vssue.Store = inject('vssue') as Vssue.Store
</script>

<template>
  <TransitionFade>
    <!-- initialized -->
    <div v-if="!vssue.VssueState.isInitializing" class="vssue-body">
      <VssueNewComment v-if="vssue.VssueState.API" />

      <!-- notice - alert and progress -->
      <VssueNotice />

      <TransitionFade>
        <!-- comments - list and pagination -->
        <VssueComments
          v-if="vssue.VssueState.comments && vssue.VssueState.comments.data.length > 0"
        />

        <VssueStatus v-else />
      </TransitionFade>
    </div>

    <VssueStatus v-else />
  </TransitionFade>
</template>
