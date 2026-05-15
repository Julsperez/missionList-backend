import { TodosService } from './todos.service.js'

const todosService = new TodosService()

export async function getTodosHandler(request, reply) {
  return reply.send(await todosService.findByUser(request.user.userId))
}

export async function createTodoHandler(request, reply) {
  return reply.code(201).send(await todosService.create(request.user.userId, request.body))
}

export async function getTodoByIdHandler(request, reply) {
  return reply.send(await todosService.findByIdAndUser(request.params.id, request.user.userId))
}

export async function updateTodoHandler(request, reply) {
  return reply.send(await todosService.update(request.params.id, request.user.userId, request.body))
}

export async function deleteTodoHandler(request, reply) {
  await todosService.delete(request.params.id, request.user.userId)
  return reply.code(204).send()
}
