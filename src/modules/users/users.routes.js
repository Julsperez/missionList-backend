import {
  getMeHandler,
  updateMeHandler,
  updateSettingsHandler,
  changePasswordHandler,
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

const changePasswordSchema = {
  body: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: { type: 'string', minLength: 1 },
      newPassword:     { type: 'string', minLength: 8  },
    },
    additionalProperties: false,
  },
}

export async function usersRoutes(app) {
  const auth = { onRequest: [app.authenticate] }

  app.get('/me',                  auth,                                        getMeHandler)
  app.patch('/me',                { ...auth, schema: updateProfileSchema },    updateMeHandler)
  app.patch('/me/settings',       { ...auth, schema: updateSettingsSchema },   updateSettingsHandler)
  app.post('/me/change-password', { ...auth, schema: changePasswordSchema },   changePasswordHandler)
  app.delete('/me',               auth,                                        deleteMeHandler)
}
