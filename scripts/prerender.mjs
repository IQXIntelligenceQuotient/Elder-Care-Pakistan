import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { renderCarePage } from '../src/care-page.mjs'

const project = new URL('../', import.meta.url)
process.chdir(fileURLToPath(project))
// Serve the same generated HTML from the repository root and the deploy folder.
const carePage = 'care-support.html'
await writeFile(carePage, renderCarePage() + '\n', 'utf8')
// Publish discovery files and app icons for Hostinger's repository-root deployment.
for (const entry of await readdir('public')) {
  await cp('public/' + entry, entry, { recursive: true })
}
await rm(new URL('dist/', project), { recursive: true, force: true })
await mkdir('dist')
await Promise.all([
  cp('assets', 'dist/assets', { recursive: true, filter: (path) => !path.split(/[\\/]/).includes('sass') }),
  cp('public', 'dist', { recursive: true }),
  ...['.htaccess', 'robots.txt', 'contact.php', 'Exception.php', 'PHPMailer.php', 'SMTP.php', 'og-image.jpg']
    .map((name) => cp(name, 'dist/' + name)),
  ...(await readdir('.')).filter((name) => name.endsWith('.html') && name !== 'Donate-Now - Copy.html')
    .map((name) => cp(name, 'dist/' + name)),
])
