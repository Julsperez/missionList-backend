import { AuthService } from './auth.service.js'
import { sendPasswordResetEmail } from '../email/email.service.js'

const authService = new AuthService()

/**
 * Opciones de cookie para el refresh token.
 * En producción el frontend y el backend están en dominios distintos
 * (GitHub Pages vs Railway), por lo que necesitamos SameSite=None + Secure.
 * En desarrollo usamos SameSite=Lax + sin Secure para compatibilidad local.
 */
const IS_PROD = process.env.NODE_ENV === 'production'

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
  path: '/api/v1/auth',
}

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

  reply.setCookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)

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

  reply.setCookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS)

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

  // Usar las mismas opciones (sin maxAge) para que el browser limpie correctamente
  reply.clearCookie('refreshToken', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path: '/api/v1/auth',
  })

  return reply.send({ message: 'Logged out successfully.' })
}

export async function handleForgotPassword(request, reply) {
  const { email } = request.body
  const result = await authService.generateResetToken(email)

  if (result) {
    const { user, plainToken } = result
    await sendPasswordResetEmail({
      to: email,
      name: user.profile?.name || email,
      token: plainToken,
    })
  }

  return reply.send({ message: 'If that email exists, a reset link has been sent.' })
}

export async function handleResetPassword(request, reply) {
  const { token, password } = request.body
  const user = await authService.validateResetToken(token)
  await authService.updatePassword(user.id, password)
  await authService.invalidateAllSessions(user.id)
  return reply.send({ message: 'Password reset successfully.' })
}
