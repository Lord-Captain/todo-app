// Vite 开发服务器代理：前端请求 /api/** 时自动转发到后端
// 好处：代码里只写相对路径，不用硬编码后端地址，也没有跨域问题
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
