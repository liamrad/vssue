import { createApp } from 'vue'
import Vssue from '@liamrad/vssue-vue3'
import PlatformAPI from '@vssue/api-github-v4'

import App from './App.vue'

import '@liamrad/vssue-vue3/style.css'

const app = createApp(App)

app.use(Vssue as any, {
  api: PlatformAPI,
  owner: import.meta.env.VITE_APP_OWNER,
  repo: import.meta.env.VITE_APP_REPO,
  clientId: import.meta.env.VITE_APP_CLIENT_ID,
  clientSecret: import.meta.env.VITE_APP_CLIENT_SECRET,
  state: 'Vssue',
  labels: ['Vssue'],
  prefix: '[Vssue]',
  admins: [],
  perPage: 5,
  proxy: (url: string) => `https://cors-anywhere.azm.workers.dev/${url}`,
  issueContent: ({ url }: { url: string }): string => url,
  autoCreateIssue: false,
})
app.mount('#app')
