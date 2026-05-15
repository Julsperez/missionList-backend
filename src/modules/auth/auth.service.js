import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma.js'
import bcrypt from 'bcrypt'
import { sendVerificationEmail } from '../email/email.service.js'

export class AuthService {
  async register({ email, password, name }) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      const err = new Error('Email already in use')
      err.statusCode = 409
      throw err
    }

    const password_hash = await bcrypt.hash(password, 12)
    const verify_token = crypto.randomBytes(32).toString('hex')
    const verify_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email,
          password_hash,
          verify_token,
          verify_token_expires_at,
          profile: { create: { name } },
          settings: { create: {} },
        },
        include: { profile: true },
      })
    })

    await sendVerificationEmail({ to: email, name: user.profile.name, token: verify_token })

    return { message: 'Registration successful. Please check your email to verify your account.' }
  }

  async verifyEmail({ token }) {
    const user = await prisma.user.findFirst({ where: { verify_token: token } })

    if (!user) {
      const err = new Error('Invalid verification token')
      err.statusCode = 400
      throw err
    }

    if (user.is_verified) {
      const err = new Error('Email already verified')
      err.statusCode = 400
      throw err
    }

    if (user.verify_token_expires_at < new Date()) {
      const err = new Error('Verification token expired')
      err.statusCode = 410
      throw err
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verify_token: null,
        verify_token_expires_at: null,
      },
    })

    return { message: 'Email verified successfully.' }
  }

  async validateCredentials({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } })

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      const err = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    if (!user.is_verified) {
      const err = new Error('Please verify your email before logging in')
      err.statusCode = 403
      throw err
    }

    return user
  }

  generateAccessToken(userId, email) {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '15m' })
  }

  generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  }

  async hashAndStoreRefreshToken(userId, refreshToken) {
    const hashed = await bcrypt.hash(refreshToken, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hashed },
    })
  }

  async rotateRefreshToken(incomingToken) {
    let payload
    try {
      payload = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      const err = new Error('Invalid or expired refresh token')
      err.statusCode = 401
      throw err
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    })

    if (!user || !user.refresh_token) {
      const err = new Error('Invalid refresh token')
      err.statusCode = 401
      throw err
    }

    const isValid = await bcrypt.compare(incomingToken, user.refresh_token)
    if (!isValid) {
      await prisma.user.update({ where: { id: user.id }, data: { refresh_token: null } })
      const err = new Error('Refresh token reuse detected')
      err.statusCode = 401
      throw err
    }

    const newAccessToken = this.generateAccessToken(user.id, user.email)
    const newRefreshToken = this.generateRefreshToken(user.id)
    await this.hashAndStoreRefreshToken(user.id, newRefreshToken)

    return { newAccessToken, newRefreshToken, user }
  }

  async clearRefreshToken(incomingToken) {
    try {
      const payload = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET)
      await prisma.user.update({
        where: { id: payload.userId },
        data: { refresh_token: null },
      })
    } catch {
      // Token expirado o inválido — la cookie se borra en el controller de todas formas
    }
  }
}
