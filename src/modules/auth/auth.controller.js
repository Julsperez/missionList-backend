import { AuthService } from './auth.service.js'

const authService = new AuthService()

export async function handleRegister(request, reply) {
  const result = await authService.register(request.body)
  return reply.code(201).send(result)
}

export async function handleVerifyEmail(request, reply) {
  const result = await authService.verifyEmail(request.body)
  return reply.send(result)
}

export async function handleLogin(request, reply) {
  const user = await authService.validateCredentials(request.body)

  const accessToken = authService.generateAccessToken(user.id, user.email)
  const refreshToken = authService.generateRefreshToken(user.id)

  await authService.hashAndStoreRefreshToken(user.id, refreshToken)

  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/api/v1/auth',
  })

  return reply.send({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.profile?.name,
    },
  })
}

export async function handleRefreshToken(request, reply) {
  const incomingToken = request.cookies.refreshToken

  if (!incomingToken) {
    return reply.code(401).send({ error: true, message: 'No refresh token provided' })
  }

  const { newAccessToken, newRefreshToken, user } =
    await authService.rotateRefreshToken(incomingToken)

  reply.setCookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/api/v1/auth',
  })

  return reply.send({
    accessToken: newAccessToken,
    user: { id: user.id, email: user.email, name: user.profile?.name },
  })
}

export async function handleLogout(request, reply) {
  const incomingToken = request.cookies.refreshToken

  if (incomingToken) {
    await authService.clearRefreshToken(incomingToken)
  }

  reply.clearCookie('refreshToken', { path: '/api/v1/auth' })
  return reply.send({ message: 'Logged out successfully.' })
}
