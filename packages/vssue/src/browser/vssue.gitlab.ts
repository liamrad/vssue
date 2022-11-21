import GitlabV4 from '@vssue/api-gitlab-v4'
import Vssue from '../main'

if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(Vssue, {
    api: GitlabV4,
  })
}
