<!-- <script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator'
import type { Vssue } from '../../types'

@Component
export default class VssueHeader extends Vue {
  @Inject() vssue!: Vssue.Store
}
</script> -->

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Vssue } from '../../types'

const vssue: Vssue.Store = inject('vssue') as Vssue.Store

const { t } = useI18n()
</script>

<template>
  <div class="vssue-header">
    <!-- comments-count - link to issue -->
    <a
      class="vssue-header-comments-count"
      :href="vssue.VssueState.issue ? vssue.VssueState.issue.link : undefined"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>
        {{
          vssue.VssueState.comments
            ? t('comments', {
              count: vssue.VssueState.comments.count,
            }, vssue.VssueState.comments.count)
            : t('comments', 0)
        }}
      </span>
    </a>

    <!-- powered-by - platform and vssue -->
    <span class="vssue-header-powered-by">
      <span>Powered by</span>

      <span v-if="vssue.VssueState.API">
        <a
          :href="vssue.VssueState.API.platform.link"
          :title="
            `${vssue.VssueState.API.platform.name} API ${vssue.VssueState.API.platform.version}`
          "
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ vssue.VssueState.API.platform.name }}
        </a>

        <span>&</span>
      </span>

      <a
        href="https://github.com/meteorlxy/vssue"
        :title="`Vssue v${vssue.version.value}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        Vssue
      </a>
    </span>
  </div>
</template>
