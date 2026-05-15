import {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
  handleRefreshToken,
  handleLogout,
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

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
}

export async function authRoutes(app) {
  app.post('/register', { schema: registerSchema }, handleRegister)
  app.post('/verify-email', { schema: verifyEmailSchema }, handleVerifyEmail)
  app.post('/login', { schema: loginSchema }, handleLogin)
  app.post('/refresh-token', handleRefreshToken)
  app.post('/logout', handleLogout)
}
