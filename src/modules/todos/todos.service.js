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

  async migrateTodos(userId, todos) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.todo.findMany({
        where: { user_id: userId },
        select: { mission_id: true },
      })

      const existingIds = new Set(existing.map((t) => t.mission_id))
      const toCreate = todos.filter((t) => !existingIds.has(t.mission_id))

      if (toCreate.length > 0) {
        await tx.todo.createMany({
          data: toCreate.map((t) => ({ ...t, user_id: userId })),
        })
      }

      return { imported: toCreate.length, skipped: todos.length - toCreate.length }
    })
  }
}
