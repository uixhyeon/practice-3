import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 개발 모드에서만 vue-devtools 활성화
    ...(process.env.NODE_ENV !== 'production' ? [vueDevTools({
      enabled: true,
      componentInspector: true
    })] : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  // vite-plugin-vue-devtools의 CSS 파일 처리 문제 해결
  optimizeDeps: {
    exclude: ['vite-plugin-vue-devtools']
  }
})
