import GithubV4 from '@vssue/api-github-v4'
import Vssue from '../main'

if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(Vssue, {
    api: GithubV4,
  })
}
