export async function healthRoutes(app) {
  app.get('/', { logLevel: 'silent' }, async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() })
  })
}
