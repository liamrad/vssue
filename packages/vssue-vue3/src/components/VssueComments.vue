<script setup lang="ts">
import { inject } from 'vue'
import type { Vssue } from '../../types'
import TransitionFade from './TransitionFade.vue'
import VssueComment from './VssueComment.vue'
import VssuePagination from './VssuePagination.vue'

const vssue: Vssue.Store = inject('vssue') as Vssue.Store
</script>

<template>
  <div class="vssue-comments">
    <!-- pagination top -->
    <VssuePagination />

    <!-- list of comments -->
    <TransitionFade group>
      <VssueComment
        v-for="comment in vssue.VssueState.comments?.data"
        :key="comment.id"
        :comment="comment"
        @editComment="comment.reactions = $event"
        @reply-comment="() => {}"
      />
    </TransitionFade>

    <!-- pagination bottom - if too many comments -->
    <VssuePagination v-show="(vssue.VssueState.comments?.data.length || 0) > 5" />
  </div>
</template>
