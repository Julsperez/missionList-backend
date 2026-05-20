import { prisma } from '../../lib/prisma.js'

function toSnake(data) {
  const mapped = {}
  if (data.name  !== undefined) mapped.name  = data.name
  if (data.color !== undefined) mapped.color = data.color
  if (data.icon  !== undefined) mapped.icon  = data.icon
  return mapped
}

function toCamel(list) {
  const result = {
    listId:    list.id,
    name:      list.name,
    color:     list.color,
    icon:      list.icon ?? null,
    createdAt: list.created_at,
  }
  // activeCount is only present when the query included _count
  if (list._count !== undefined) {
    result.activeCount = list._count.todos ?? 0
  }
  return result
}

export class ListsService {
  async create(userId, data) {
    const list = await prisma.list.create({
      data: { ...toSnake(data), user_id: userId },
    })
    return toCamel(list)
  }

  async findByUserId(userId) {
    const [lists, totalCount] = await Promise.all([
      prisma.list.findMany({
        where:   { user_id: userId },
        orderBy: { created_at: 'asc' },
        include: {
          _count: {
            select: { todos: { where: { status: { not: 'archived' } } } },
          },
        },
      }),
      prisma.todo.count({
        where: { user_id: userId, status: { not: 'archived' } },
      }),
    ])
    return { lists: lists.map(toCamel), totalCount }
  }

  async #findOwned(listId, userId) {
    const list = await prisma.list.findFirst({
      where: { id: listId, user_id: userId },
    })
    if (!list) {
      const err = new Error('List not found')
      err.statusCode = 404
      throw err
    }
    return list
  }

  async update(listId, userId, data) {
    const existing = await this.#findOwned(listId, userId)
    const list = await prisma.list.update({
      where: { id: existing.id },
      data: toSnake(data),
    })
    return toCamel(list)
  }

  async delete(listId, userId) {
    await this.#findOwned(listId, userId)
    await prisma.list.delete({ where: { id: listId } })
  }
}
