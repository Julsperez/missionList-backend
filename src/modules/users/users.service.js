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
}
