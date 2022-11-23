import { computed, reactive, watch } from 'vue'
import { getCleanURL } from '@vssue/utils'
import type { Vssue, VssueAPI } from '../types'
import i18n from './i18n'

interface VssueState {
  options: Vssue.Options | null
  title: string | ((options: Vssue.Options) => string)
  issueId: number | string | null
  API: VssueAPI.Instance | null
  accessToken: string | null
  user: VssueAPI.User | null
  issue: VssueAPI.Issue | null
  comments: VssueAPI.Comments | null
  query: VssueAPI.Query
  isInitializing: boolean
  isIssueNotCreated: boolean
  isLoginRequired: boolean
  isFailed: boolean
  isCreatingIssue: boolean
  isLoadingComments: boolean
  isCreatingComment: boolean
  isUpdatingComment: boolean
}

export function useVssueStore() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
  let { locale, messages } = i18n.global

  const VssueState = reactive<VssueState>({
    options: null,
    title: '',
    issueId: null,
    API: null,
    accessToken: null,
    user: null,
    issue: null,
    comments: null,
    query: {
      page: 1,
      perPage: 10,
      sort: 'desc',
    },
    isInitializing: true,
    isIssueNotCreated: false,
    isLoginRequired: false,
    isFailed: false,
    isCreatingIssue: false,
    isLoadingComments: false,
    isCreatingComment: false,
    isUpdatingComment: false,
  })

  const version = computed((): string => import.meta.env.VUE_APP_VERSION)
  const issueTitle = computed((): string => {
    if (VssueState.options === null)
      return ''

    return typeof VssueState.title === 'function'
      ? VssueState.title(VssueState.options)
      : `${VssueState.options.prefix}${VssueState.title}`
  })
  const isPending = computed((): boolean => VssueState.isLoadingComments || VssueState.isCreatingComment || VssueState.isUpdatingComment)
  const isLogined = computed((): boolean => VssueState.accessToken !== null && VssueState.user !== null)
  const isAdmin = computed((): boolean => {
    return (
      VssueState.options !== null
      && VssueState.accessToken !== null
      && VssueState.user !== null
      && (VssueState.user.username === VssueState.options.owner
        || VssueState.options.admins.includes(VssueState.user.username))
    )
  })
  const accessTokenKey = computed((): string => {
    return VssueState.API
      ? `Vssue.${VssueState.API.platform.name.toLowerCase()}.access_token`
      : ''
  })

  watch(() => VssueState.query.perPage, () => {
    VssueState.query.page = 1
    getComments()
  })
  watch(() => [VssueState.query.page, VssueState.query.sort], () => {
    getComments()
  })

  function setOptions(options: Partial<Vssue.Options>) {
    VssueState.options = Object.assign(
      {
        labels: ['Vssue'],
        state: 'Vssue',
        prefix: '[Vssue]',
        admins: [],
        perPage: 10,
        proxy: (url: string): string =>
          `https://cors-anywhere.azm.workers.dev/${url}`,
        issueContent: ({ url }: { url: string }): string => url,
        autoCreateIssue: false,
      },
      options,
    ) as Vssue.Options

    // check options
    const requiredOptions: ['api', 'owner', 'repo', 'clientId'] = ['api', 'owner', 'repo', 'clientId']
    for (const opt of requiredOptions) {
      if (!VssueState.options[opt])
        console.warn(`[Vssue] the option '${opt}' is required`)
    }

    // set locale
    if (VssueState.options.locale) {
      locale = VssueState.options.locale as any
    }
    else {
      const locales = Object.keys(messages)
      const navLangs = window.navigator.languages
      locale = navLangs.filter(item => locales.includes(item)).shift() || 'en' as any
    }
  }

  async function init(): Promise<void> {
    try {
      // init VssueStore
      await initStore()

      // init comments
      await initComments()
    }
    catch (e: any) {
      if (e.response && [401, 403].includes(e.response.status)) {
        // in some cases, require login to load comments
        VssueState.isLoginRequired = true
      }
      else {
        VssueState.isFailed = true
      }
      console.error(e)
    }
  }

  async function initStore(): Promise<void> {
    try {
      if (!VssueState.options)
        throw new Error('Options are required to initialize Vssue')

      // reset data
      VssueState.API = null
      VssueState.accessToken = null
      VssueState.user = null
      VssueState.issue = null
      VssueState.comments = null
      VssueState.query = {
        page: 1,
        perPage: VssueState.options.perPage,
        sort: 'desc',
      }

      // reset status
      VssueState.isInitializing = true
      VssueState.isIssueNotCreated = false
      VssueState.isLoginRequired = false
      VssueState.isFailed = false
      VssueState.isCreatingIssue = false
      VssueState.isLoadingComments = false
      VssueState.isCreatingComment = false
      VssueState.isUpdatingComment = false

      // get the VssueAPI instance according to the options.api
      const APIConstructor = VssueState.options.api

      VssueState.API = new APIConstructor({
        baseURL: VssueState.options.baseURL,
        labels: VssueState.options.labels,
        state: VssueState.options.state,
        owner: VssueState.options.owner,
        repo: VssueState.options.repo,
        clientId: VssueState.options.clientId,
        clientSecret: VssueState.options.clientSecret,
        proxy: VssueState.options.proxy,
      })

      // handle authorization
      await handleAuth()
    }
    finally {
      VssueState.isInitializing = false
    }
  }

  async function initComments(): Promise<void> {
    if (!VssueState.API || !VssueState.options)
      return

    if (VssueState.issueId) {
      // if issueId is set, get the issue and comments in the mean time
      // notice that vssue will not try to create the issue is not found
      const [issue, comments] = await Promise.all([
        VssueState.API.getIssue({
          accessToken: VssueState.accessToken,
          issueId: VssueState.issueId,
        }),
        VssueState.API.getComments({
          accessToken: VssueState.accessToken,
          issueId: VssueState.issueId,
          query: VssueState.query,
        }),
      ])
      VssueState.issue = issue
      VssueState.comments = comments
    }
    else {
      // get issue according to title
      VssueState.issue = await VssueState.API.getIssue({
        accessToken: VssueState.accessToken,
        issueTitle: issueTitle.value,
      })

      if (VssueState.issue === null) {
        // if the issue of this page does not exist
        VssueState.isIssueNotCreated = true

        // try to create issue when `autoCreateIssue = true`
        if (VssueState.options.autoCreateIssue)
          await postIssue()
      }
      else {
        // try to load comments
        await getComments()
      }
    }
  }

  async function postIssue(): Promise<void> {
    if (!VssueState.API || !VssueState.options || VssueState.issue || VssueState.issueId)
      return

    // login to create issue
    if (!isLogined.value)
      login()

    // only owner/admins can create issue
    if (!isAdmin.value)
      return

    try {
      VssueState.isCreatingIssue = true

      const issue = await VssueState.API.postIssue({
        title: issueTitle.value,
        content: await VssueState.options.issueContent({
          options: VssueState.options,
          url: getCleanURL(window.location.href),
        }),
        accessToken: VssueState.accessToken,
      })

      VssueState.issue = issue
      VssueState.isIssueNotCreated = false

      await getComments()
    }
    catch (e) {
      VssueState.isFailed = true
    }
    finally {
      VssueState.isCreatingIssue = false
    }
  }

  async function getComments(emits?: (event: 'error', ...args: any[]) => void): Promise<VssueAPI.Comments | void> {
    try {
      if (!VssueState.API || !VssueState.issue || VssueState.isLoadingComments)
        return

      VssueState.isLoadingComments = true

      const comments = await VssueState.API.getComments({
        accessToken: VssueState.accessToken,
        issueId: VssueState.issue.id,
        query: VssueState.query,
      })

      VssueState.comments = comments

      if (VssueState.query.page !== comments.page)
        VssueState.query.page = comments.page

      if (VssueState.query.perPage !== comments.perPage)
        VssueState.query.perPage = comments.perPage

      return comments
    }
    catch (e: any) {
      if (
        e.response
        && [401, 403].includes(e.response.status)
        && !isLogined.value
      ) {
        VssueState.isLoginRequired = true
      }
      else {
        emits?.('error', e)
        throw e
      }
    }
    finally {
      VssueState.isLoadingComments = false
    }
  }

  async function postComment({
    content,
  }: {
    content: string
  }, emits?: (event: 'error', ...args: any[]) => void): Promise<VssueAPI.Comment | void> {
    try {
      if (!VssueState.API || !VssueState.issue || VssueState.isCreatingComment)
        return

      VssueState.isCreatingComment = true

      const comment = await VssueState.API.postComment({
        accessToken: VssueState.accessToken,
        content,
        issueId: VssueState.issue.id,
      })

      return comment
    }
    catch (e) {
      emits?.('error', e)
      throw e
    }
    finally {
      VssueState.isCreatingComment = false
    }
  }

  async function putComment({
    commentId,
    content,
  }: {
    commentId: number | string
    content: string
  }, emits?: (event: 'error', ...args: any[]) => void): Promise<VssueAPI.Comment | void> {
    try {
      if (!VssueState.API || !VssueState.issue)
        return

      const comment = await VssueState.API.putComment({
        accessToken: VssueState.accessToken,
        issueId: VssueState.issue.id,
        commentId,
        content,
      })

      return comment
    }
    catch (e) {
      emits?.('error', e)
      throw e
    }
  }

  async function deleteComment({
    commentId,
  }: {
    commentId: number | string
  }, emits?: (event: 'error', ...args: any[]) => void): Promise<boolean | void> {
    try {
      if (!VssueState.API || !VssueState.issue)
        return

      const success = await VssueState.API.deleteComment({
        accessToken: VssueState.accessToken,
        issueId: VssueState.issue.id,
        commentId,
      })

      return success
    }
    catch (e) {
      emits?.('error', e)
      throw e
    }
  }

  async function getCommentReactions({
    commentId,
  }: {
    commentId: string | number
  }, emits?: (event: 'error', ...args: any[]) => void): Promise<VssueAPI.Reactions | void> {
    try {
      if (!VssueState.API || !VssueState.issue)
        return

      const reactions = await VssueState.API.getCommentReactions({
        accessToken: VssueState.accessToken,
        issueId: VssueState.issue.id,
        commentId,
      })

      return reactions
    }
    catch (e) {
      emits?.('error', e)
      throw e
    }
  }

  async function postCommentReaction({
    commentId,
    reaction,
  }: {
    commentId: string | number
    reaction: keyof VssueAPI.Reactions
  }, emits?: (event: 'error', ...args: any[]) => void): Promise<boolean> {
    try {
      if (!VssueState.API || !VssueState.issue)
        return false

      const success = await VssueState.API.postCommentReaction({
        accessToken: VssueState.accessToken,
        issueId: VssueState.issue.id,
        commentId,
        reaction,
      })

      return success
    }
    catch (e) {
      emits?.('error', e)
      throw e
    }
  }

  function login(): void {
    if (!VssueState.API)
      return
    VssueState.API.redirectAuth()
  }

  function logout(): void {
    setAccessToken(null)
    VssueState.user = null
  }

  async function handleAuth(): Promise<void> {
    if (!VssueState.API)
      return

    // handle authorize and try to get the access_token
    const accessToken = await VssueState.API.handleAuth()

    if (accessToken) {
      // new access_token
      setAccessToken(accessToken)
      VssueState.user = await VssueState.API.getUser({ accessToken })
    }
    else if (getAccessToken()) {
      // have access_token in localstorage
      VssueState.user = await VssueState.API.getUser({ accessToken: VssueState.accessToken })
    }
    else {
      // no access_token
      setAccessToken(null)
      VssueState.user = null
    }
  }

  function getAccessToken(): VssueAPI.AccessToken {
    VssueState.accessToken = window.localStorage.getItem(accessTokenKey.value)
    return VssueState.accessToken
  }

  function setAccessToken(token: VssueAPI.AccessToken): void {
    if (token === null)
      window.localStorage.removeItem(accessTokenKey.value)
    else
      window.localStorage.setItem(accessTokenKey.value, token)

    VssueState.accessToken = token
  }

  return {
    VssueState,
    version,
    issueTitle,
    isPending,
    isLogined,
    isAdmin,
    accessTokenKey,
    setOptions,
    init,
    initStore,
    initComments,
    postIssue,
    getComments,
    postComment,
    putComment,
    deleteComment,
    getCommentReactions,
    postCommentReaction,
    login,
    logout,
    handleAuth,
    getAccessToken,
    setAccessToken,
  }
}
