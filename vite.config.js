import { defineConfig } from 'vite'
import { renderCarePage } from './src/care-page.mjs'

function guardPhp(request, response, next) {
  if (request.url?.split('?')[0] !== '/contact.php') return next()
  response.statusCode = 503
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify({ message: 'This preview cannot send messages. Run the PHP preview or contact us by email.' }))
}

export default defineConfig({
  plugins: [{
    name: 'elder-care-static-routes',
    configureServer(server) {
      server.middlewares.use(guardPhp)
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
