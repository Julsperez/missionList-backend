import { getTodosHandler, createTodoHandler, getTodoByIdHandler, updateTodoHandler, deleteTodoHandler, migrateTodosHandler } from './todos.controller.js'

const getTodosSchema = {
  querystring: {
    type: 'object',
    properties: {
      listId: { type: 'string' },
    },
    additionalProperties: false,
  },
}

const createTodoSchema = {
  body: {
    type: 'object',
    required: ['missionId', 'title'],
    properties: {
      missionId:     { type: 'string', minLength: 1, maxLength: 100 },
      listId:        { type: 'string', nullable: true },
      title:         { type: 'string', minLength: 1, maxLength: 200 },
      subtitle:      { type: 'string', maxLength: 200 },
      description:   { type: 'string', maxLength: 2000 },
      status:        { type: 'string', enum: ['in-progress', 'completed', 'archived'] },
      typeofMission: { type: 'string', enum: ['main', 'side'] },
      dueDate:       { type: 'string', nullable: true },
      objectives:    { type: 'array' },
    },
    additionalProperties: false,
  },
}

const updateTodoSchema = {
  body: {
    type: 'object',
    properties: {
      listId:        { type: 'string', nullable: true },
      title:         { type: 'string', minLength: 1, maxLength: 200 },
      subtitle:      { type: 'string', maxLength: 200 },
      description:   { type: 'string', maxLength: 2000 },
      status:        { type: 'string', enum: ['in-progress', 'completed', 'archived'] },
      typeofMission: { type: 'string', enum: ['main', 'side'] },
      dueDate:       { type: 'string', nullable: true },
      objectives:    { type: 'array' },
    },
    additionalProperties: false,
  },
}

const migrateTodosSchema = {
  body: {
    type: 'object',
    required: ['todos'],
    properties: {
      todos: { type: 'array' },
    },
    additionalProperties: false,
  },
}


export async function todosRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  app.get('/', { ...auth, schema: getTodosSchema }, getTodosHandler)
  app.post('/', { ...auth, schema: createTodoSchema }, createTodoHandler)
  app.post('/migrate', { ...auth, schema: migrateTodosSchema }, migrateTodosHandler)
  app.get('/:id', auth, getTodoByIdHandler)
  app.patch('/:id', { ...auth, schema: updateTodoSchema }, updateTodoHandler)
  app.delete('/:id', auth, deleteTodoHandler)
}
