import { UsersService } from './users.service.js'

const usersService = new UsersService()

export async function getMeHandler(request, reply) {
  return reply.send(await usersService.getProfile(request.user.userId))
}

export async function updateMeHandler(request, reply) {
  return reply.send(await usersService.updateProfile(request.user.userId, request.body))
}

export async function updateSettingsHandler(request, reply) {
  return reply.send(await usersService.updateSettings(request.user.userId, request.body))
}

export async function deleteMeHandler(request, reply) {
  await usersService.deleteUser(request.user.userId)
  return reply.code(204).send()
}
