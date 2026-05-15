import {
  handleRegister,
  handleVerifyEmail,
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
} from './auth.controller.js'

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      name: { type: 'string', minLength: 1, maxLength: 100 },
    },
    additionalProperties: false,
  },
}

const verifyEmailSchema = {
  body: {
    type: 'object',
    required: ['token'],
    properties: {
      token: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
}

export async function authRoutes(app) {
  app.post('/register', { schema: registerSchema }, handleRegister)
  app.post('/verify-email', { schema: verifyEmailSchema }, handleVerifyEmail)
  app.post('/login', loginHandler)
  app.post('/refresh', refreshTokenHandler)
  app.post('/logout', { onRequest: [app.authenticate] }, logoutHandler)
}
