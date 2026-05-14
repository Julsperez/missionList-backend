import { TodosService } from './todos.service.js'

const todosService = new TodosService()

export async function getTodosHandler(request, reply) {
  return reply.send(await todosService.findByUser(request.user.id))
}
