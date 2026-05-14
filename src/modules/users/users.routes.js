import { getMeHandler } from './users.controller.js'

export async function usersRoutes(app) {
  app.get('/me', { onRequest: [app.authenticate] }, getMeHandler)
}
