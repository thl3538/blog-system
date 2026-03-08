import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd', '@ant-design/icons'],
          router: ['react-router-dom'],
          markdown: [
            '@uiw/react-md-editor',
            '@uiw/react-markdown-preview',
            'react-markdown',
            'remark-gfm',
          ],
        },
      },
    },
  },
});
