import {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
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

const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  },
}

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'password'],
    properties: {
      token: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 8 },
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
  app.post('/forgot-password', { schema: forgotPasswordSchema }, handleForgotPassword)
  app.post('/reset-password', { schema: resetPasswordSchema }, handleResetPassword)
}
