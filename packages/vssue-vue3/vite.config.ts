// import { resolve } from 'node: path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsConfigFilePath: '../../tsconfig.json',
    }),
  ],
  build: {
    target: 'modules',
    outDir: 'dist',
    // cssCodeSplit: true,
    minify: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd', 'iife'],
      name: 'Vssue',
    },
  },
})

