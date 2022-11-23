<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Vssue, VssueAPI } from '../../types'
import VssueButton from './VssueButton.vue'
import VssueIcon from './VssueIcon.vue'

const { t } = useI18n()

const vssue: Vssue.Store = inject('vssue') as Vssue.Store

const input = ref<HTMLInputElement | null>(null)

const content = ref('')
const user = computed((): VssueAPI.User | null => vssue.VssueState.user)
const platform = computed((): string | null | undefined => vssue.VssueState.API?.platform.name)
const loading = computed((): boolean => vssue.VssueState.isCreatingComment)
const isInputDisabled = computed((): boolean => loading.value || user.value === null || vssue.VssueState.issue === null)
const isSubmitDisabled = computed((): boolean => content.value === '' || vssue.isPending.value || vssue.VssueState.issue === null)
const contentRows = computed((): number => content.value.split('\n').length - 1)
const inputRows = computed((): number => contentRows.value < 3 ? 5 : contentRows.value + 2)

watch(() => vssue.VssueState.replyContent, (replyContent) => {
  // content.value = content.value.concat(n)
  content.value = `${replyContent}\n${content.value}`
  nextTick(() => {
    input.value?.focus()
  })
})

const submit = async (): Promise<void> => {
  if (isSubmitDisabled.value)
    return
  await vssue.postComment({ content: content.value })
  content.value = ''
  await vssue.getComments()
}
</script>

<template>
  <div class="vssue-new-comment">
    <div class="vssue-comment-avatar">
      <a
        v-if="user"
        :href="user.homepage"
        :title="user.username"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="user.avatar" :alt="user.username">
      </a>

      <VssueIcon
        v-else
        :name="platform?.toLowerCase() || ''"
        :title="t('loginToComment', { platform })"
        @click="vssue.login()"
      />
    </div>
    <!-- .vssue-new-comment-avatar -->

    <div class="vssue-new-comment-body">
      <textarea
        ref="input"
        v-model="content"
        class="vssue-new-comment-input"
        :rows="inputRows"
        :disabled="isInputDisabled"
        :placeholder="t(user ? 'placeholder' : 'noLoginPlaceHolder')"
        :spellcheck="false"
        aria-label="leave a comment"
        @keyup.enter.ctrl="submit()"
      />
    </div>
    <!-- .vssue-new-comment-body -->

    <div class="vssue-new-comment-footer">
      <span v-if="user" class="vssue-current-user">
        <span>{{ t('currentUser') }} - {{ user.username }} - </span>

        <a class="vssue-logout" @click="vssue.logout()">
          {{ t('logout') }}
        </a>
      </span>

      <span v-else class="vssue-current-user">
        {{ t('loginToComment', { platform }) }}
      </span>

      <div class="vssue-new-comment-operations">
        <VssueButton
          v-if="user"
          class="vssue-button-submit-comment"
          type="primary"
          :disabled="isSubmitDisabled"
          @click="submit()"
        >
          <VssueIcon v-show="loading" name="loading" />

          {{ t(loading ? 'submitting' : 'submitComment') }}
        </VssueButton>

        <VssueButton
          v-else
          class="vssue-button-login"
          type="primary"
          :title="t('loginToComment', { platform })"
          @click="vssue.login()"
        >
          {{ t('login', { platform }) }}
        </VssueButton>
      </div>
    </div>
    <!-- .vssue-new-comment-footer -->
  </div>
</template>
