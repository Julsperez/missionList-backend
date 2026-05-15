import { prisma } from '../../lib/prisma.js'

export class TodosService {
  async findByUser(userId) {
    return prisma.todo.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })
  }

  async create(userId, data) {
    return prisma.todo.create({
      data: { ...data, user_id: userId },
    })
  }

  async findByIdAndUser(id, userId) {
    const todo = await prisma.todo.findFirst({
      where: { id, user_id: userId },
    })
    if (!todo) {
      const err = new Error('Todo not found')
      err.statusCode = 404
      throw err
    }
    return todo
  }

  async update(id, userId, data) {
    await this.findByIdAndUser(id, userId)
    return prisma.todo.update({
      where: { id },
      data: { ...data },
    })
  }

  async delete(id, userId) {
    await this.findByIdAndUser(id, userId)
    await prisma.todo.delete({ where: { id } })
  }
}
