import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { origin, renderCarePage } from '../src/care-page.mjs'

const mode = process.argv[2]
const sitemapNs = 'http://www.sitemaps.org/schemas/sitemap/0.9'
// Update the affected route's date when its public content changes.
const releaseLastModified = '2026-11-06'
const xml = '<?xml version="1.0" encoding="UTF-8"?>'
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const htmlFiles = (await readdir('.')).filter((file) => file.endsWith('.html') && !['404.html', 'Donate-Now - Copy.html', 'care-support.html'].includes(file))
const pages = await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, 'utf8')]))
pages.push(['care-support.html', renderCarePage()])
pages.sort(([a], [b]) => a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b))
const pathFor = (name) => name === 'index.html' ? '/' : '/' + name
const pageUrl = (name) => origin + pathFor(name)

async function publish(name, content) {
  await mkdir('public', { recursive: true })
  await writeFile('public/' + name, content + '\n', 'utf8')
  if (existsSync('dist')) await writeFile('dist/' + name, content + '\n', 'utf8')
}

if (!mode || mode === 'sitemap') {
  const entries = pages.map(([file]) => {
    const home = file === 'index.html'
    const hub = file === 'care-support.html' || file === 'master-donation-hub.html'
    const frequency = home || hub ? 'weekly' : 'monthly'
    const priority = home ? '1.0' : hub ? '0.9' : '0.8'
    return '  <url><loc>' + escape(pageUrl(file)) + '</loc><lastmod>' + releaseLastModified +
      '</lastmod><changefreq>' + frequency + '</changefreq><priority>' + priority + '</priority></url>'
  })
  const sitemap = [xml, '<urlset xmlns="' + sitemapNs + '">', ...entries, '</urlset>'].join('\n')
  await publish('sitemap.xml', sitemap)
  await writeFile('sitemap.xml', sitemap + '\n', 'utf8')
  await publish('sitemap-index.xml', [
    xml, '<sitemapindex xmlns="' + sitemapNs + '">',
    ...['sitemap.xml', 'image-sitemap.xml'].map((file) => '  <sitemap><loc>' + origin + '/' + file + '</loc></sitemap>'),
    '</sitemapindex>',
  ].join('\n'))
}

if (!mode || mode === 'images') {
  const entries = []
  for (const [file, html] of pages) {
    const images = new Set()
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    for (const [, src] of markup.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
      const path = src.replace(/^\//, '')
      if (!/^assets\/img\/(?:about|blog|hero|causes|logos|optimized)\//i.test(path)) continue
      if (/receipt-|donation-qr-preview|signature|logo-white|whatsapp\.svg|directions-preview\.svg|chat-outline\.svg/i.test(path) || !existsSync(decodeURIComponent(path))) continue
      images.add(new URL(path, origin + '/').href)
    }
    if (!images.size) continue
    entries.push('  <url>\n    <loc>' + escape(pageUrl(file)) + '</loc>\n' + [...images]
      .map((url) => '    <image:image><image:loc>' + escape(url) + '</image:loc></image:image>').join('\n') + '\n  </url>')
  }
  await publish('image-sitemap.xml', [
    xml, '<urlset xmlns="' + sitemapNs + '" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries, '</urlset>',
  ].join('\n'))
}

if (!mode || mode === 'llms') {
  await publish('llms.txt', [
    '# Elder Care Pakistan', '',
    '> Elder Care Pakistan supports older people and their families through care coordination, mobility assistance, community programmes and responsible giving.', '',
    'Official website: ' + origin + '/', '',
    '## Care and service enquiries', '',
    '- [Get elder care support](' + origin + '/care-support.html): Programme links and how to ask about eligibility and availability.',
    '- [Home nursing](' + origin + '/Nurse-at-Home.html): Ask about qualified nursing support where available.',
    '- [Dialysis referrals](' + origin + '/Dialysis-at-Home.html): Renal-care guidance and qualified referrals.',
    '- [Home physiotherapy](' + origin + '/Physiotherapy-at-Home.html): Guidance on physiotherapy support after review.',
    '- [Contact and addresses](' + origin + '/Contact-Us.html): Confirm availability with the organisation. The contact page lists a Lahore head office and a Pattika, Muzaffarabad AJK care home address.', '',
    '## About and giving', '',
    '- [About](' + origin + '/About-Us.html): Organisation mission and leadership.',
    '- [Elder care blogs](' + origin + '/blogs.html): Eight family guides linking to original articles on Tralionex Insights.',
    '- [Ways to give](' + origin + '/master-donation-hub.html): Donation options and gifts in kind.',
    '- [Donation and overseas transfer guidance](' + origin + '/Donate-Now1.html): Ask the organisation for verified instructions and receipt guidance.',
  ].join('\n'))
}
