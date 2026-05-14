import { prisma } from '../../lib/prisma.js'
import bcrypt from 'bcrypt'

export class AuthService {
  async register({ email, password, name }) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      const err = new Error('Email already in use')
      err.statusCode = 409
      throw err
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        profile: { create: { name } },
        settings: { create: {} },
      },
      include: { profile: true },
    })

    return { id: user.id, email: user.email, name: user.profile.name }
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } })

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      const err = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    return { id: user.id, email: user.email, name: user.profile?.name }
  }
}
