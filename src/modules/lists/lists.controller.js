import { ListsService } from './lists.service.js'

const listsService = new ListsService()

export async function createListHandler(request, reply) {
  return reply.code(201).send(await listsService.create(request.user.userId, request.body))
}

export async function getListsHandler(request, reply) {
  return reply.send(await listsService.findByUserId(request.user.userId))
}

export async function updateListHandler(request, reply) {
  return reply.send(await listsService.update(request.params.id, request.user.userId, request.body))
}

export async function deleteListHandler(request, reply) {
  await listsService.delete(request.params.id, request.user.userId)
  return reply.code(204).send()
}
