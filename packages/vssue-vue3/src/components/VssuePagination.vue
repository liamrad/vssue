<script setup lang="ts">
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Vssue } from '../../types'
import VssueIcon from './VssueIcon.vue'

const { t } = useI18n()

const vssue: Vssue.Store = inject('vssue') as Vssue.Store

const disabled = computed((): boolean => vssue.isPending.value)
const pageCount = computed((): number => {
  const pageCount = Math.ceil(
    vssue.VssueState.comments!.count / vssue.VssueState.comments!.perPage,
  )
  return pageCount > 1 ? pageCount : 1
})
const perPageOptions = computed((): Array<number> => {
  const perPageOptions: Array<number> = [5, 10, 20, 50]
  if (
    !perPageOptions.includes(vssue.VssueState.options!.perPage)
    && vssue.VssueState.options!.perPage < 100
  )
    perPageOptions.push(vssue.VssueState.options!.perPage)

  return perPageOptions.sort((a, b) => a - b)
})
const page = computed({
  get(): number {
    return vssue.VssueState.query.page > pageCount.value
      ? pageCount.value
      : vssue.VssueState.query.page
  },
  set(val: number) {
    if (val > 0 && val <= pageCount.value)
      vssue.VssueState.query.page = val
  },
})
const perPage = computed({
  get() {
    return vssue.VssueState.query.perPage
  },
  set(val: number) {
    if (perPageOptions.value.includes(val))
      vssue.VssueState.query.perPage = val
  },
})
</script>

<template>
  <div class="vssue-pagination">
    <div class="vssue-pagination-per-page">
      <label>
        <select
          v-model="perPage"
          class="vssue-pagination-select"
          :disabled="disabled"
        >
          <option v-for="val in perPageOptions" :key="val" :value="val">
            {{ val }}
          </option>
        </select>

        <span>
          {{ t('perPage') }}
        </span>
      </label>

      <span
        v-if="vssue.VssueState.API?.platform.meta.sortable"
        class="vssue-pagination-link" :class="{
          disabled,
        }"
        :title="t('sort')"
        @click="vssue.VssueState.query.sort = vssue.VssueState.query.sort === 'asc' ? 'desc' : 'asc'"
      >
        {{ vssue.VssueState.query.sort === 'asc' ? `↑` : `↓` }}
      </span>
    </div>

    <div class="vssue-pagination-page">
      <span
        class="vssue-pagination-link" :class="{
          disabled: page === 1 || disabled,
        }"
        :title="t('prev')"
        @click="page -= 1"
        v-text="`<`"
      />

      <label>
        <span>
          {{ t('page') }}
        </span>

        <select
          v-show="pageCount > 1"
          v-model="page"
          class="vssue-pagination-select"
          :disabled="disabled"
        >
          <option v-for="val in pageCount" :key="val" :value="val">
            {{ val }}
          </option>
        </select>

        <span v-show="pageCount < 2" v-text="page" />

        <span v-text="` / ${pageCount} `" />
      </label>

      <span
        class="vssue-pagination-link" :class="{
          disabled: page === pageCount || disabled,
        }"
        :title="t('next')"
        @click="page += 1"
        v-text="`>`"
      />
    </div>
  </div>
</template>
