import { prisma } from '../../lib/prisma.js'

// camelCase (frontend) → snake_case (Prisma)
function toSnake(data) {
  const mapped = {}
  if (data.missionId     !== undefined) mapped.mission_id      = data.missionId
  if (data.title         !== undefined) mapped.title           = data.title
  if (data.subtitle      !== undefined) mapped.subtitle        = data.subtitle
  if (data.description   !== undefined) mapped.description     = data.description
  if (data.status        !== undefined) mapped.status          = data.status
  if (data.typeofMission !== undefined) mapped.type_of_mission = data.typeofMission
  if (data.dueDate       !== undefined) mapped.due_date        = data.dueDate || null
  if (data.objectives    !== undefined) mapped.objectives      = data.objectives
  return mapped
}

// snake_case (Prisma) → camelCase (API response)
function toCamel(todo) {
  return {
    id:            todo.id,
    missionId:     todo.mission_id,
    title:         todo.title,
    subtitle:      todo.subtitle       ?? '',
    description:   todo.description    ?? '',
    status:        todo.status,
    typeofMission: todo.type_of_mission,
    dueDate:       todo.due_date ? todo.due_date.toISOString().split('T')[0] : null,
    objectives:    todo.objectives     ?? [],
    createdAt:     todo.created_at,
    updatedAt:     todo.updated_at,
    isCompleted:   todo.status === 'completed',
  }
}


export class TodosService {
  async findByUser(userId) {
    const todos = await prisma.todo.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })
    return todos.map(toCamel)
  }

  async create(userId, data) {
    const todo = await prisma.todo.create({
      data: { ...toSnake(data), user_id: userId },
    })
    return toCamel(todo)
  }

  async findByMissionIdAndUser(missionId, userId) {
    const todo = await prisma.todo.findFirst({
      where: { mission_id: missionId, user_id: userId },
    })
    if (!todo) {
      const err = new Error('Todo not found')
      err.statusCode = 404
      throw err
    }
    return todo
  }

  async update(missionId, userId, data) {
    const existing = await this.findByMissionIdAndUser(missionId, userId)
    const todo = await prisma.todo.update({
      where: { id: existing.id },
      data: toSnake(data),
    })
    return toCamel(todo)
  }

  async delete(missionId, userId) {
    const existing = await this.findByMissionIdAndUser(missionId, userId)
    await prisma.todo.delete({ where: { id: existing.id } })
  }

  async migrateTodos(userId, todos) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.todo.findMany({
        where: { user_id: userId },
        select: { mission_id: true },
      })

      const existingIds = new Set(existing.map((t) => t.mission_id))
      const toCreate = todos.filter((t) => !existingIds.has(t.missionId))

      if (toCreate.length > 0) {
        await tx.todo.createMany({
          data: toCreate.map((t) => ({ ...toSnake(t), user_id: userId })),
        })
      }

      return { imported: toCreate.length, skipped: todos.length - toCreate.length }
    })
  }
}
