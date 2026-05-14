import { prisma } from '../../lib/prisma.js'

export class TodosService {
  async findByUser(userId) {
    return prisma.todo.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })
  }
}
