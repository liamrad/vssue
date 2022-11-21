import GiteaV1 from '@vssue/api-gitea-v1'
import Vssue from '../main'

if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(Vssue, {
    api: GiteaV1,
  })
}
