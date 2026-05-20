import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'

import { authenticate } from './middleware/authenticate.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { todosRoutes } from './modules/todos/todos.routes.js'
import { listsRoutes } from './modules/lists/lists.routes.js'
import { healthRoutes } from './routes/health.js'

export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: opts.logger ?? {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    ...opts,
  })

  // Soporta lista de orígenes separada por comas: CORS_ORIGIN=https://a.com,https://b.com
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  await app.register(cors, {
    origin: (origin, cb) => {
      // Permitir peticiones sin origen (Postman, curl, health-checks internos)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  await app.register(cookie, { secret: process.env.JWT_SECRET })
  await app.register(jwt, { secret: process.env.JWT_SECRET })

  app.decorate('authenticate', authenticate)

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode || 500
    app.log.error(error)
    reply.status(statusCode).send({
      error: true,
      message: statusCode === 500 ? 'Internal Server Error' : error.message,
    })
  })

  // Auth routes — rate limit estricto por IP
  await app.register(async (scope) => {
    await scope.register(rateLimit, {
      max: parseInt(process.env.AUTH_RATE_LIMIT) || 10,
      timeWindow: '1 minute',
      keyGenerator: (request) => request.ip,
    })
    await scope.register(authRoutes, { prefix: '/api/v1/auth' })
  })

  // API routes — rate limit holgado por IP
  await app.register(async (scope) => {
    await scope.register(rateLimit, {
      max: parseInt(process.env.API_RATE_LIMIT) || 200,
      timeWindow: '1 minute',
      keyGenerator: (request) => request.ip,
    })
    await scope.register(usersRoutes, { prefix: '/api/v1/users' })
    await scope.register(todosRoutes, { prefix: '/api/v1/todos' })
    await scope.register(listsRoutes, { prefix: '/api/v1/lists' })
  })

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(healthRoutes, { prefix: '/api/v1/health' })

  return app
}
