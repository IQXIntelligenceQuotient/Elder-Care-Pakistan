import { defineConfig } from 'vite'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { request as httpRequest } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { renderCarePage } from './src/care-page.mjs'

function guardPhp(request, response, next) {
  if (request.url?.split('?')[0] !== '/contact.php') return next()
  response.statusCode = 503
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify({ message: 'Local PHP is unavailable. Start npm run dev with PHP installed to test the contact form.' }))
}

function connectLocalPhp(server) {
  const xampp = 'C:/xampp/php/php.exe'
  const executable = process.env.ECP_PHP_BINARY || (process.platform === 'win32' && existsSync(xampp) ? xampp : 'php')
  const smtpFile = join(dirname(server.config.root), 'eldercare-contact-smtp.ini')
  const smtpMode = process.env.ECP_LOCAL_SMTP
  const sendRealMail = smtpMode === '1' || (smtpMode !== '0' && existsSync(smtpFile))
  const capture = sendRealMail ? '' : mkdtempSync(join(tmpdir(), 'ecp-contact-mail-'))
  const php = spawn(executable, ['-S', '127.0.0.1:0', '-t', server.config.root], {
    env: { ...process.env, ECP_CONTACT_CAPTURE: capture },
    stdio: ['ignore', 'ignore', 'pipe'],
    windowsHide: true,
  })
  let port
  php.stderr.setEncoding('utf8')
  php.stderr.on('data', chunk => {
    if (port) return
    port = chunk.match(/Development Server \(http:\/\/127\.0\.0\.1:(\d+)\) started/)?.[1]
    if (port && capture) server.config.logger.info(`Contact email previews: ${capture}`)
    if (port && sendRealMail) server.config.logger.info('Contact form is using SMTP delivery.')
  })
  php.on('error', error => server.config.logger.warn(`Local contact PHP could not start: ${error.message}`))
  php.on('exit', () => { port = undefined })
  server.httpServer?.once('close', () => php.kill())

  return (request, response, next) => {
    if (request.url?.split('?')[0] !== '/contact.php') return next()
    if (!port || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress)) {
      return guardPhp(request, response, next)
    }
    const upstream = httpRequest({
      hostname: '127.0.0.1',
      port,
      path: request.url,
      method: request.method,
      headers: request.headers,
    }, result => {
      response.writeHead(result.statusCode, result.headers)
      result.pipe(response)
    })
    upstream.on('error', () => guardPhp(request, response, next))
    response.on('close', () => upstream.destroy())
    request.pipe(upstream)
  }
}

export default defineConfig({
  plugins: [{
    name: 'elder-care-static-routes',
    configureServer(server) {
      server.middlewares.use(connectLocalPhp(server))
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0]
        if (path !== '/care-support.html') return next()
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(renderCarePage())
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(guardPhp)
    },
  }],
})
