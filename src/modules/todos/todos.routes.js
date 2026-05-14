import { getTodosHandler } from './todos.controller.js'

export async function todosRoutes(app) {
  app.get('/', { onRequest: [app.authenticate] }, getTodosHandler)
}
