import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { PurgeCSS } from 'purgecss'
import { transform } from 'esbuild'

// Keep dynamic plugin states while removing theme selectors unused by public pages.
const htmlFiles = (await readdir('dist')).filter(name => name.endsWith('.html'))
const content = await Promise.all(htmlFiles.map(async name => ({
  raw: await readFile('dist/' + name, 'utf8'),
  extension: 'html',
})))
const replacements = new Map()
for (const original of ['assets/img/logos/whatsapp.svg', 'assets/img/logos/chat-outline.svg']) {
  const source = await readFile(original)
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12)
  const output = original.replace(/\.svg$/, '.' + hash + '.svg')
  await writeFile(output, source)
  await writeFile('dist/' + output, source)
  replacements.set(original, output)
}
for (const directory of ['css', 'js']) {
  const names = (await readdir('dist/assets/' + directory)).filter(name =>
    name.endsWith('.' + directory) && !/\.[a-f0-9]{12}\.(?:css|js)$/.test(name))
  for (const name of names) {
    const original = 'assets/' + directory + '/' + name
    let source = await readFile('dist/' + original, 'utf8')
    if (directory === 'css' && ['style.css', 'bootstrap.min.css', 'fontawesome.min.css'].includes(name)) {
      const [result] = await new PurgeCSS().purge({
        content: [...content, 'assets/js/*.js'],
        css: [{ raw: source }],
        safelist: {
          standard: ['body', 'html', 'dialog', 'backdrop'],
          greedy: [/slick/, /mfp-/, /nice-select/, /active/, /open/, /show/, /collaps/, /sticky/, /ecp-/, /flaticon/],
        },
      })
      source = result.css
    }
    const result = await transform(source, {
      loader: directory,
      minify: true,
      legalComments: 'inline',
      target: directory === 'js' ? 'es2020' : undefined,
    })
    const hash = createHash('sha256').update(result.code).digest('hex').slice(0, 12)
    const output = original.replace(/\.(css|js)$/, '.' + hash + '.$1')
    await writeFile('dist/' + output, result.code)
    // Hostinger Git also serves the repository root, so publish the same assets there.
    await writeFile(output, result.code)
    replacements.set(original, output)
  }
}
const homeStyles = ['bootstrap.min.css', 'fontawesome.min.css', 'spacing.min.css', 'style.css']
const homeCss = (await Promise.all(homeStyles.map(name =>
  readFile(replacements.get('assets/css/' + name), 'utf8')))).join('\n')
const homeHash = createHash('sha256').update(homeCss).digest('hex').slice(0, 12)
const homeStylesheet = 'assets/css/home-core.' + homeHash + '.css'
await writeFile(homeStylesheet, homeCss)
await writeFile('dist/' + homeStylesheet, homeCss)
replacements.set('assets/css/home-core.css', homeStylesheet)

for (const name of htmlFiles) {
  let html = await readFile('dist/' + name, 'utf8')
  html = html.replace(/((?:href|src)=["'])(\/?assets\/(?:css|js|img\/logos)\/[^"'?]+)(?:\?[^"']*)?(["'])/g,
    (match, prefix, path, quote) => {
      const original = path.replace(/^\//, '').replace(/\.[a-f0-9]{12}(?=\.(?:css|js|svg)$)/, '')
      const replacement = replacements.get(original)
      return replacement ? prefix + '/' + replacement + quote : match
    })
  if (name === 'index.html') {
    let inserted = false
    html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/(?:bootstrap\.min|fontawesome\.min|spacing\.min|style|home-core)\.[a-f0-9]{12}\.css">/g,
      () => {
        if (inserted) return ''
        inserted = true
        return '<link rel="stylesheet" href="/' + homeStylesheet + '">'
      })
    html = html.replace(/^[ \t]+$/gm, '')
  }
  await writeFile('dist/' + name, html)
  await writeFile(name, html)
}
