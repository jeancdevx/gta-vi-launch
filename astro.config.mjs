import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { GET as getStreamers } from './server/streamers.ts'

const ENV_KEYS = new Set([
  'TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'YOUTUBE_API_KEY',
  'ENABLE_KICK_LIVE'
])

function loadLocalEnv() {
  for (const filename of ['.env', '.env.local']) {
    const filePath = resolve(process.cwd(), filename)

    if (!existsSync(filePath)) continue

    for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim()

      if (!line || line.startsWith('#')) continue

      const separator = line.indexOf('=')

      if (separator <= 0) continue

      const key = line.slice(0, separator).trim()

      if (!ENV_KEYS.has(key)) continue

      const value = line
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')

      if (value) process.env[key] = value
    }
  }
}

function devStreamersApiPlugin() {
  let cachedBody = ''
  let cachedAt = 0

  return {
    name: 'gta-vi-dev-streamers-api',
    enforce: 'post',
    configureServer(server) {
      loadLocalEnv()

      return () => {
        server.middlewares.stack.unshift({
          route: '',
          handle: async (req, res, next) => {
            const pathname = (req.url ?? '').split('?')[0]

            if (pathname !== '/api/streamers' && pathname !== '/api/streamers/')
              return next()

            try {
              loadLocalEnv()

              const now = Date.now()

              if (!cachedBody || now - cachedAt > 30_000) {
                const response = await getStreamers()

                cachedBody = await response.text()
                cachedAt = now
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.setHeader('Cache-Control', 'no-store')
              res.end(cachedBody)
            } catch {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ mode: 'directory', configured: false }))
            }
          }
        })
      }
    }
  }
}

export default defineConfig({
  site: 'https://gta-vi-launch-five.vercel.app',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss(), devStreamersApiPlugin()] }
})
