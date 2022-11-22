import GithubV3 from '@vssue/api-github-v3'
import Vssue from '../main'

if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(Vssue, {
    api: GithubV3,
  })
}
