import BitbucketV2 from '@vssue/api-bitbucket-v2'
import Vssue from '../main'

if (typeof window !== 'undefined' && (window as any).Vue) {
  (window as any).Vue.use(Vssue, {
    api: BitbucketV2,
  })
}
