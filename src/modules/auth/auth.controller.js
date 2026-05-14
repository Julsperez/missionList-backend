import { AuthService } from './auth.service.js'

const authService = new AuthService()

export async function registerHandler(request, reply) {
  const result = await authService.register(request.body)
  return reply.code(201).send(result)
}

export async function loginHandler(request, reply) {
  return reply.send(await authService.login(request.body))
}

export async function refreshTokenHandler(_request, reply) {
  return reply.code(501).send({ message: 'Not implemented' })
}

export async function logoutHandler(_request, reply) {
  return reply.code(501).send({ message: 'Not implemented' })
}
