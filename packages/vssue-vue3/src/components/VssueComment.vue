<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue'
import { formatDateTime } from '@vssue/utils'
import { useI18n } from 'vue-i18n'
import type { Vssue, VssueAPI } from '../../types'
import VssueIcon from './VssueIcon.vue'

const props = defineProps<{
  comment: VssueAPI.Comment
}>()

const emits = defineEmits(['editComment', 'error', 'reply-comment'])

const { t } = useI18n()

const vssue: Vssue.Store = inject('vssue') as Vssue.Store

const input = ref<HTMLInputElement | null>(null)

const editMode = ref(false)
const editContent = ref<string>(props.comment.contentRaw)
const creatingReactions = ref<Array<keyof VssueAPI.Reactions>>([])
const isPutingComment = ref(false)
const isDeletingComment = ref(false)

const currentUser = computed((): string | null => vssue.VssueState.user ? vssue.VssueState.user.username : null)
const content = computed((): string => props.comment.content)
const author = computed((): VssueAPI.User => props.comment.author)
const createdAt = computed((): string => formatDateTime(props.comment.createdAt))
const updatedAt = computed((): string => formatDateTime(props.comment.updatedAt))
const showReactions = computed((): boolean => Boolean(
  vssue.VssueState.API?.platform.meta.reactable
    && props.comment.reactions
    && editMode.value,
))
const reactionKeys = computed((): Array<keyof VssueAPI.Reactions> => ['heart', 'like', 'unlike'])
const editContentRows = computed((): number => (editContent.value.split('\n').length - 1))
const editInputRows = computed((): number => ((editContentRows.value < 3) ? 5 : (editContentRows.value + 2)))
const postReaction = async ({
  reaction,
}: {
  reaction: keyof VssueAPI.Reactions
}): Promise<void> => {
  //
  try {
    if (creatingReactions.value.includes(reaction))
      return

    creatingReactions.value.push(reaction)

    const success = await vssue.VssueState.postCommentReaction({
      commentId: props.comment.id,
      reaction,
    })

    if (!success) {
      emits(
        'error',
        new Error(
          t('reactionGiven', {
            reaction: t(reaction),
          }) as string,
        ),
      )
    }

    // always refresh reactions even already given
    const reactions = await vssue.VssueState.getCommentReactions({
      commentId: props.comment.id,
    })
    if (reactions)
      emits('editComment', reactions)
      // props.comment.reactions = reactions
  }
  finally {
    creatingReactions.value.splice(
      creatingReactions.value.findIndex(item => item === reaction),
      1,
    )
  }
}
const enterEdit = (): void => {
  editMode.value = true
  nextTick(() => {
    input.value?.focus()
  })
}
const resetEdit = (): void => {
  editMode.value = false
  editContent.value = props.comment.contentRaw
}
const putComment = async (): Promise<void> => {
  try {
    if (vssue.isPending)
      return

    if (editContent.value !== props.comment.contentRaw) {
      isPutingComment.value = true
      vssue.VssueState.isUpdatingComment = true

      const comment = await vssue.putComment({
        commentId: props.comment.id,
        content: editContent.value,
      })

      if (comment) {
        vssue.VssueState.comments!.data.splice(
          vssue.VssueState.comments!.data.findIndex(
            (item: any) => item.id === comment.id,
          ),
          1,
          comment,
        )
      }
    }

    editMode.value = false
  }
  finally {
    isPutingComment.value = false
    vssue.VssueState.isUpdatingComment = false
  }
}
const deleteComment = async (): Promise<void> => {
  try {
    if (vssue.isPending)
      return

    if (!window.confirm(t('deleteConfirm') as string))
      return

    isDeletingComment.value = true
    vssue.VssueState.isUpdatingComment = true

    const success = await vssue.deleteComment({
      commentId: props.comment.id,
    })

    if (success) {
      // decrease count immediately
      vssue.VssueState.comments!.count -= 1

      // if there are more than one comment on this page, remove the deleted comment immediately
      if (vssue.VssueState.comments!.data.length > 1) {
        vssue.VssueState.comments!.data.splice(
          vssue.VssueState.comments!.data.findIndex(
            item => item.id === props.comment.id,
          ),
          1,
        )
      }

      // if the page count should be decreased, change the query param to trigger comments reload
      if (
        vssue.VssueState.query.page > 1
        && vssue.VssueState.query.page
          > Math.ceil(vssue.VssueState.comments!.count / vssue.VssueState.query.perPage)
      )
        vssue.VssueState.query.page -= 1
      else
        await vssue.getComments()
    }
    else {
      vssue.$emit(
        'error',
        new Error(t('deleteFailed') as string),
      )
    }
  }
  finally {
    isDeletingComment.value = false
    vssue.VssueState.isUpdatingComment = false
  }
}
</script>

<template>
  <div
    class="vssue-comment"
    :class="{
      'vssue-comment-edit-mode': editMode,
      'vssue-comment-disabled': isDeletingComment || isPutingComment,
    }"
  >
    <!-- avatar -->
    <div class="vssue-comment-avatar">
      <a
        :href="author.homepage"
        :title="author.username"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="author.avatar" :alt="author.username">
      </a>
    </div>

    <!-- comment -->
    <div class="vssue-comment-body">
      <slot name="body">
        <div class="vssue-comment-header">
          <!-- author - username - link to profile page -->
          <span class="vssue-comment-author">
            <a
              :href="author.homepage"
              :title="author.username"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ author.username }}
            </a>
          </span>

          <!-- created-at -->
          <span class="vssue-comment-created-at">
            {{ createdAt }}
          </span>
        </div>

        <!-- comment content - html string - we trust platform api so use v-html -->
        <div class="vssue-comment-main">
          <textarea
            v-if="editMode"
            ref="input"
            v-model="editContent"
            class="vssue-edit-comment-input"
            :rows="editInputRows"
            @keyup.enter.ctrl="putComment()"
          />

          <!-- eslint-disable vue/no-v-html -->
          <article v-else class="markdown-body" v-html="content" />
          <!-- eslint-enable vue/no-v-html -->
        </div>

        <div class="vssue-comment-footer">
          <!-- edit mode hint -->
          <span v-if="editMode" class="vssue-comment-hint">
            {{ t('editMode') }}
          </span>

          <!-- reactions -->
          <span v-if="showReactions" class="vssue-comment-reactions">
            <span
              v-for="reaction in reactionKeys"
              :key="reaction"
              class="vssue-comment-reaction"
              :title="
                t(
                  creatingReactions.includes(reaction) ? 'loading' : reaction,
                )
              "
              @click="postReaction({ reaction })"
            >
              <VssueIcon
                :name="
                  creatingReactions.includes(reaction) ? 'loading' : reaction
                "
                :title="
                  t(
                    creatingReactions.includes(reaction) ? 'loading' : reaction,
                  )
                "
              />

              <span class="vssue-comment-reaction-number">
                {{ comment?.reactions?.[reaction] }}
              </span>
            </span>
          </span>

          <!-- operations -->
          <span class="vssue-comment-operations">
            <span
              v-if="comment.author.username === currentUser && editMode"
              class="vssue-comment-operation"
              :class="{ 'vssue-comment-operation-muted': isPutingComment }"
              :title="t(isPutingComment ? 'loading' : 'submit')"
              @click="putComment()"
            >
              <VssueIcon
                v-show="isPutingComment"
                name="loading"
                :title="t('loading')"
              />

              {{ t('submit') }}
            </span>

            <span
              v-if="comment.author.username === currentUser && editMode"
              class="vssue-comment-operation vssue-comment-operation-muted"
              :title="t('cancel')"
              @click="resetEdit()"
            >
              {{ t('cancel') }}
            </span>

            <span
              v-if="comment.author.username === currentUser"
              v-show="!editMode"
              class="vssue-comment-operation"
              @click="enterEdit()"
            >
              <VssueIcon name="edit" :title="t('edit')" />
            </span>

            <span
              v-if="comment.author.username === currentUser || vssue.isAdmin"
              v-show="!editMode"
              class="vssue-comment-operation"
              @click="deleteComment()"
            >
              <VssueIcon
                :name="isDeletingComment ? 'loading' : 'delete'"
                :title="t(isDeletingComment ? 'loading' : 'delete')"
              />
            </span>

            <span
              v-show="!editMode"
              class="vssue-comment-operation"
              @click="emits('reply-comment', comment)"
            >
              <VssueIcon name="reply" :title="t('reply')" />
            </span>
          </span>
        </div>
      </slot>
    </div>
  </div>
</template>
