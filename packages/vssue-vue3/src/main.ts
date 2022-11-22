import type { App } from 'vue'
import { h } from 'vue'
import type { Vssue } from '../types'
import VssueComponent from './Vssue.vue'

const VssuePlugin: Vssue.Plugin = {
  get version() {
    return import.meta.env.VUE_APP_VERSION as string
  },

  installed: false,

  install(Vue: App, options) {
    if (this.installed)
      return false

    this.installed = true

    Vue.component('Vssue', {
      props: {
        title: {
          type: String,
          required: false,
          default: undefined,
        },
        issueId: {
          type: [Number, String],
          required: false,
          default: undefined,
        },
        options: {
          type: Object,
          required: false,
          default: undefined,
        },
      },
      setup(props, _ctx) {
        return () => h(
          VssueComponent,
          {
            title: props.title,
            issueId: props.issueId,
            options: Object.assign({}, options, props.options),
          },
        )
      },
    })
  },

  VssueComponent,
}

export { VssueComponent }
export default VssuePlugin
