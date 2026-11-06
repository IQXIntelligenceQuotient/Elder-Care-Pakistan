import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { Script } from 'node:vm'
import { origin } from '../src/care-page.mjs'

const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]))
assert.equal(new Set(routes.map((route) => route.href)).size, routes.length, 'Duplicate sitemap routes')
assert.equal(await readFile('care-support.html', 'utf8'), await readFile('dist/care-support.html', 'utf8'))
const pageIds = new Map()
const fragmentLinks = []
assert(routes.length >= 23, 'Expected the existing public pages and the care hub')
for (const route of routes) {
  assert.equal(route.origin, origin)
  const filename = route.pathname === '/' ? 'index.html' : route.pathname.slice(1)
  const html = await readFile('dist/' + filename, 'utf8')
  assert.match(html, /<title>[^<]+<\/title>/i, filename)
  assert.match(html, /<meta name="description" content="[^"]+"/i, filename)
  assert.match(html, /<meta property="og:title" content="[^"]+"/i, filename)
  assert.equal([...html.matchAll(/<h1[\s>]/gi)].length, 1, filename)
  assert.match(html, /<main\b[^>]*id="main-content"/i, filename)
  assert(html.includes('rel="canonical" href="' + route.href + '"'), filename + ' canonical')
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  const schema = blocks.flatMap((block) => JSON.parse(block[1])['@graph'])
  assert(schema.some((node) => node['@type'] === 'FAQPage'), filename + ' FAQ schema')
  assert.match(html, /<summary\b[^>]*>\s*\S/i, filename + ' visible FAQ')
  const ids = schema.map((node) => node['@id']).filter(Boolean)
  assert.equal(new Set(ids).size, ids.length, filename + ' duplicate schema IDs')
  for (const [, attributes, source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\b(?:src|type)=/i.test(attributes)) new Script(source, { filename })
  }
  const markup = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  pageIds.set(filename, new Set([...markup.matchAll(/<[^>]+\sid=["']([^"']+)["']/gi)].map((match) => match[1])))
  for (const match of markup.matchAll(/<(?:a|link|img|script)\b[^>]*\b(?:href|src)="([^"]+)"[^>]*>/gi)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), route)
    if (url.origin !== origin) continue
    const target = decodeURIComponent(url.pathname.slice(1))
    assert(existsSync('dist/' + target), filename + ' missing ' + target)
    if (url.hash && match[0].startsWith('<a ')) {
      fragmentLinks.push([filename, target || 'index.html', decodeURIComponent(url.hash.slice(1))])
    }
    if (match[0].startsWith('<img')) assert.match(match[0], /\balt="[^"]*"/i, filename)
  }
}
for (const [filename, target, fragment] of fragmentLinks) {
  if (pageIds.has(target)) assert(pageIds.get(target).has(fragment), filename + ' missing ' + target + '#' + fragment)
}
for (const file of ['robots.txt', 'sitemap-index.xml', 'image-sitemap.xml', 'llms.txt', 'humans.txt', 'site.webmanifest', 'favicon.ico', 'favicon.svg', 'og-image.jpg']) {
  assert(existsSync('dist/' + file), file)
}
assert.match(await readFile('dist/image-sitemap.xml', 'utf8'), /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/)
assert.deepEqual((await readdir('dist')).filter((name) => name.endsWith('.php')).sort(),
  ['Exception.php', 'PHPMailer.php', 'SMTP.php', 'contact.php'].sort())
assert.match(await readFile('dist/Contact-Us.html', 'utf8'), /action="\/contact\.php" method="post"/)
console.log('Verified ' + routes.length + ' static HTML routes and discovery files.')
