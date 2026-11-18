import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { assetCatalog } from '../src/helpers/assets.helpers.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const report = []

async function download(url, destination, kind) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': 'gta-vi-launch-asset-sync' }
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const type = response.headers.get('content-type') ?? ''

  if (!bytes.length || (kind === 'image' && !type.includes('image/')))
    throw new Error(`Contenido inesperado: ${type}`)

  if (
    kind === 'font' &&
    !['wOFF', 'wOF2', 'OTTO', 'true', '\u0000\u0001\u0000\u0000'].includes(
      bytes.subarray(0, 4).toString('latin1')
    )
  )
    throw new Error('La respuesta no es una tipografía válida')
  await mkdir(destination.slice(0, destination.lastIndexOf('/')), {
    recursive: true
  })
  await writeFile(`${destination}.tmp`, bytes)
  await rename(`${destination}.tmp`, destination)

  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  }
}

for (const [key, entry] of Object.entries(assetCatalog)) {
  try {
    const path = `${root}public/${entry.file}`
    const present = await stat(path).catch(() => null)
    const metadata = present?.size
      ? {
          bytes: present.size,
          sha256: createHash('sha256')
            .update(await readFile(path))
            .digest('hex')
        }
      : await download(entry.url, path, 'image')

    report.push({ key, ...entry, status: 'local', ...metadata })
    console.log(`✓ ${entry.file}`)
  } catch (error) {
    report.push({ key, ...entry, status: 'pending', error: error.message })
    console.error(`× ${entry.file}: ${error.message}`)
  }
}

// Discover real filenames instead of guessing hashed Rockstar font URLs.
// Keep originals and copy the regular/bold faces to stable names used by CSS.
try {
  const response = await fetch(
    'https://api.github.com/repos/midudev/landing-gta-vi/contents/public/fonts',
    {
      signal: AbortSignal.timeout(20000),
      headers: {
        'User-Agent': 'gta-vi-launch-asset-sync',
        Accept: 'application/vnd.github+json'
      }
    }
  )

  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const files = (await response.json()).filter(file =>
    /\.(woff2?|ttf|otf)$/i.test(file.name)
  )

  if (!files.length)
    throw new Error('No se encontraron tipografías en el repositorio')
  const regular =
    files.find(file => /regular/i.test(file.name)) ??
    files.find(file => !/bold|black|italic|medium/i.test(file.name)) ??
    files[0]
  const bold =
    files.find(
      file => /bold|medium/i.test(file.name) && !/italic/i.test(file.name)
    ) ?? regular

  for (const file of files) {
    const metadata = await download(
      file.download_url,
      `${root}public/fonts/${file.name}`,
      'font'
    )

    report.push({
      key: `font:${file.name}`,
      url: file.download_url,
      file: `fonts/${file.name}`,
      status: 'local',
      ...metadata
    })
  }

  await writeFile(
    `${root}public/fonts/gta-regular.font`,
    await readFile(`${root}public/fonts/${regular.name}`)
  )
  await writeFile(
    `${root}public/fonts/gta-bold.font`,
    await readFile(`${root}public/fonts/${bold.name}`)
  )
  console.log(`✓ Tipografías: ${regular.name}, ${bold.name}`)
} catch (error) {
  report.push({
    key: 'fonts',
    status: 'pending',
    source: 'https://github.com/midudev/landing-gta-vi/tree/main/public/fonts',
    error: error.message
  })
  console.error(`× Tipografías: ${error.message}`)
}

await mkdir(`${root}docs`, { recursive: true })
await writeFile(
  `${root}docs/assets-report.json`,
  JSON.stringify(
    { checkedAt: new Date().toISOString(), assets: report },
    null,
    2
  ) + '\n'
)
const pending = report.filter(asset => asset.status === 'pending')

console.log(
  `${report.length - pending.length} recursos locales; ${pending.length} pendientes. Informe: docs/assets-report.json`
)

if (pending.length) process.exitCode = 1
