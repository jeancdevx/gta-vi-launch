import { readFileSync } from 'node:fs'
import { matchesGlob, relative } from 'node:path'

const formatterConfig = JSON.parse(
  readFileSync(new URL('./.oxfmtrc.json', import.meta.url), 'utf8')
)
const linterConfig = JSON.parse(
  readFileSync(new URL('./.oxlintrc.json', import.meta.url), 'utf8')
)
const quote = value => `'${value.replaceAll("'", "'\\''")}'`
const isIncluded = (file, patterns) =>
  !patterns.some(pattern => matchesGlob(relative(process.cwd(), file), pattern))

export default stagedFiles => {
  const lintFiles = stagedFiles.filter(
    file =>
      /\.(?:[cm]?[jt]sx?|astro)$/.test(file) &&
      isIncluded(file, linterConfig.ignorePatterns)
  )
  const formatFiles = stagedFiles.filter(
    file =>
      /\.(?:[cm]?[jt]sx?|astro|jsonc?|css|mdx?|html|ya?ml|toml)$/.test(file) &&
      isIncluded(file, formatterConfig.ignorePatterns)
  )

  return [
    ...(lintFiles.length
      ? [`oxlint --fix --deny-warnings ${lintFiles.map(quote).join(' ')}`]
      : []),
    ...(formatFiles.length
      ? [`oxfmt --write ${formatFiles.map(quote).join(' ')}`]
      : [])
  ]
}
