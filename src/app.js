import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'

import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { todosRoutes } from './modules/todos/todos.routes.js'

export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: opts.logger ?? {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    ...opts,
  })

  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })

  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  await app.register(cookie, { secret: process.env.JWT_SECRET })

  await app.register(jwt, { secret: process.env.JWT_SECRET })

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode || 500
    app.log.error(error)
    reply.status(statusCode).send({
      error: true,
      message: statusCode === 500 ? 'Internal Server Error' : error.message,
    })
  })

  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(usersRoutes, { prefix: '/api/v1/users' })
  await app.register(todosRoutes, { prefix: '/api/v1/todos' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
