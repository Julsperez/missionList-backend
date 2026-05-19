import {
  getMeHandler,
  updateMeHandler,
  updateSettingsHandler,
  deleteMeHandler,
} from './users.controller.js'

const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
    },
    additionalProperties: false,
  },
}

const updateSettingsSchema = {
  body: {
    type: 'object',
    properties: {
      theme:    { type: 'string', enum: ['light', 'dark', 'system'] },
      language: { type: 'string', enum: ['es', 'en'] },
    },
    additionalProperties: false,
  },
}

export async function usersRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  app.get('/me',            auth,                                      getMeHandler)
  app.patch('/me',          { ...auth, schema: updateProfileSchema },  updateMeHandler)
  app.patch('/me/settings', { ...auth, schema: updateSettingsSchema }, updateSettingsHandler)
  app.delete('/me',         auth,                                      deleteMeHandler)
}
