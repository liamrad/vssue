> A vue-powered issue-based comment plugin for vue3.  

## Base

[Vssue](https://www.github.com/meteorlxy/vssue). 

## Install

```bash
pnpm i @liamrad/vssue-vue3
```

## Usage

> [more info](https://vssue.js.org/zh/guide/)  

```js
// 引入 vue
import { createApp } from 'vue'
// 引入 vssue
import Vssue from '@liamrad/vssue-vue3'
// 引入对应平台的 api 包
import GithubV4 from '@vssue/api-github-v4'
// 引入 vssue 的样式文件
import '@liamrad/vssue-vue3/style.css'

const app = createApp({
  // ...
})

app.use(Vssue, {
  // 设置要使用的平台 api
  api: GithubV4,

  // 在这里设置你使用的平台的 OAuth App 配置
  owner: 'OWNER_OF_REPO',
  repo: 'NAME_OF_REPO',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET', // 只有在使用某些平台时需要
})
```
