import { getTodosHandler, createTodoHandler, getTodoByIdHandler, updateTodoHandler, deleteTodoHandler, migrateTodosHandler } from './todos.controller.js'

export async function todosRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  app.get('/', auth, getTodosHandler)
  app.post('/', auth, createTodoHandler)
  app.post('/migrate', auth, migrateTodosHandler)
  app.get('/:id', auth, getTodoByIdHandler)
  app.patch('/:id', auth, updateTodoHandler)
  app.delete('/:id', auth, deleteTodoHandler)
}
