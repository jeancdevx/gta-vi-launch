import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
// No --global: every installation belongs to this project alone.
const packages = [
  ['elayadesign/ai-design-skills', 'landing-page-design'],
  ['emilkowalski/skills', 'emil-design-eng', 'animate', 'choreograph'],
  ['vercel-labs/skills', 'find-skills'],
  ['vercel-labs/agent-skills', 'web-design-guidelines']
]

for (const [source, ...skills] of packages) {
  const result = spawnSync(
    'npx',
    [
      '--yes',
      'skills@1.7.4',
      'add',
      source,
      '--skill',
      ...skills,
      '--agent',
      'codex',
      '--yes',
      '--copy'
    ],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, npm_config_cache: `${root}.cache/npm` }
    }
  )

  if (result.error || result.status !== 0) {
    console.error(
      `No se pudo instalar ${source}. Las copias locales existentes se conservan.`,
      result.error?.message ?? ''
    )
    process.exit(result.status || 1)
  }
}
