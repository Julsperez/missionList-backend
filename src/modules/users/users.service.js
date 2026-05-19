import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'

export class UsersService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, settings: true },
    })

    if (!user) {
      const err = new Error('User not found')
      err.statusCode = 404
      throw err
    }

    return {
      id: user.id,
      email: user.email,
      name: user.profile?.name,
      theme: user.settings?.theme,
      language: user.settings?.language,
    }
  }

  async updateProfile(userId, data) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      const err = new Error('User not found')
      err.statusCode = 404
      throw err
    }

    if (data.name !== undefined) {
      await prisma.profile.upsert({
        where:  { user_id: userId },
        update: { name: data.name },
        create: { user_id: userId, name: data.name },
      })
    }

    return this.getProfile(userId)
  }

  async updateSettings(userId, data) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      const err = new Error('User not found')
      err.statusCode = 404
      throw err
    }

    const hasUpdates = data.theme !== undefined || data.language !== undefined
    if (hasUpdates) {
      const updateData = {}
      if (data.theme    !== undefined) updateData.theme    = data.theme
      if (data.language !== undefined) updateData.language = data.language

      await prisma.userSettings.upsert({
        where:  { user_id: userId },
        update: updateData,
        create: { user_id: userId, theme: data.theme ?? 'system', language: data.language ?? 'es' },
      })
    }

    return this.getProfile(userId)
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      const err = new Error('User not found')
      err.statusCode = 404
      throw err
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) {
      const err = new Error('Contraseña actual incorrecta.')
      err.statusCode = 401
      throw err
    }

    const password_hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data:  { password_hash },
    })
  }

  async deleteUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      const err = new Error('User not found')
      err.statusCode = 404
      throw err
    }

    await prisma.user.delete({ where: { id: userId } })
  }
}
