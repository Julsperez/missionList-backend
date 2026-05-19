import { createListHandler, getListsHandler, updateListHandler, deleteListHandler } from './lists.controller.js'

const createListSchema = {
  body: {
    type: 'object',
    required: ['name', 'color'],
    properties: {
      name:  { type: 'string', minLength: 1, maxLength: 100 },
      color: { type: 'string', minLength: 1, maxLength: 50 },
      icon:  { type: 'string', maxLength: 50 },
    },
    additionalProperties: false,
  },
}

const updateListSchema = {
  body: {
    type: 'object',
    properties: {
      name:  { type: 'string', minLength: 1, maxLength: 100 },
      color: { type: 'string', minLength: 1, maxLength: 50 },
      icon:  { type: 'string', maxLength: 50 },
    },
    additionalProperties: false,
  },
}

export async function listsRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  app.post('/',     { ...auth, schema: createListSchema }, createListHandler)
  app.get('/',      auth,                                  getListsHandler)
  app.patch('/:id', { ...auth, schema: updateListSchema }, updateListHandler)
  app.delete('/:id', auth,                                 deleteListHandler)
}
