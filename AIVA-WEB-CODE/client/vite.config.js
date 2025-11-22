import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react-hook-form', 'firebase/app', 'firebase/storage']
  },
  esbuild: {
    loader: 'jsx',
    include: /\.[jt]sx?$/,
    exclude: [],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // disable sourcemaps in production to avoid framer-motion warnings
    chunkSizeWarningLimit: 3000, // raise limit to 3MB to avoid warnings for Electron app
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Separate heavy libraries into their own chunks for better caching
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          vendor: ['@reduxjs/toolkit', 'react-redux', 'react-router-dom', 'socket.io-client'],
          ui: ['@headlessui/react', '@heroicons/react', 'react-hot-toast', 'sonner'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts', '@nivo/bar'],
          calendar: ['@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/interaction', '@fullcalendar/list', '@fullcalendar/react', '@fullcalendar/timegrid'],
          editor: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit', 'lowlight', 'prosemirror-state'],
          utils: ['date-fns', 'clsx', 'moment']
        },
      },
    },
  },
});
