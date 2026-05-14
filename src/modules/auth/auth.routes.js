import {
  registerHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
} from './auth.controller.js'

export async function authRoutes(app) {
  app.post('/register', registerHandler)
  app.post('/login', loginHandler)
  app.post('/refresh', refreshTokenHandler)
  app.post('/logout', { onRequest: [app.authenticate] }, logoutHandler)
}
