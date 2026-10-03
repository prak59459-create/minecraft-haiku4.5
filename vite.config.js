import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'esnext',
        minify: 'terser'
    },
    server: {
        open: true
    }
});
