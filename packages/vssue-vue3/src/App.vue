<script setup lang="ts">
import PlatformAPI from '@vssue/api-github-v4'
import type { Vssue } from '../types'
import VssueComponent from './Vssue.vue'

const options: Partial<Vssue.Options> = {
  api: PlatformAPI,
  owner: import.meta.env.VUE_APP_OWNER,
  repo: import.meta.env.VUE_APP_REPO,
  clientId: import.meta.env.VUE_APP_CLIENT_ID,
  clientSecret: import.meta.env.VUE_APP_CLIENT_SECRET,
  state: 'Vssue',
  labels: ['Vssue'],
  prefix: '[Vssue]',
  admins: [],
  perPage: 5,
  proxy: url => `https://cors-anywhere.azm.workers.dev/${url}`,
  issueContent: ({ url }) => url,
  autoCreateIssue: false,
}

const issueId = 2
</script>

<template>
  <VssueComponent
    :options="options"
    :issue-id="issueId"
  />
</template>
