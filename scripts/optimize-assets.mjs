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
for (const name of htmlFiles) {
  let html = await readFile('dist/' + name, 'utf8')
  html = html.replace(/((?:href|src)=["'])(\/?assets\/(?:css|js)\/[^"'?]+)(?:\?[^"']*)?(["'])/g,
    (match, prefix, path, quote) => {
      const original = path.replace(/^\//, '').replace(/\.[a-f0-9]{12}(?=\.(?:css|js)$)/, '')
      const replacement = replacements.get(original)
      return replacement ? prefix + '/' + replacement + quote : match
    })
  await writeFile('dist/' + name, html)
  await writeFile(name, html)
}
