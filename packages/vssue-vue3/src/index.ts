import { h } from 'vue'
import type { App } from 'vue'
import Vssue from './Vssue.vue'
import i18n from './i18n'

import './styles/index.styl'
import 'github-markdown-css'

export default (app: App, options: any) => {
  app.use(i18n)
  app.component('Vssue', {
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
    setup(props) {
      return () => h(Vssue, {
        title: props.title,
        issueId: props.issueId,
        options: Object.assign({}, options, props.options),
      })
    },
  })
}
