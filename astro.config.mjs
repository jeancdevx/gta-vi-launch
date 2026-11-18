import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://gta-vi-launch-five.vercel.app',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] }
})
