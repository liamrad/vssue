import GiteeV5 from '@vssue/api-gitee-v5'
import Vssue from '../main'

if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(Vssue, {
    api: GiteeV5,
  })
}
