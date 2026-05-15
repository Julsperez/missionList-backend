import { UsersService } from './users.service.js'

const usersService = new UsersService()

export async function getMeHandler(request, reply) {
  return reply.send(await usersService.getProfile(request.user.userId))
}
