import 'dotenv/config'
import { buildApp } from './app.js'

const PORT = parseInt(process.env.PORT) || 3001
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'

const start = async () => {
  const app = await buildApp()
  try {
    await app.listen({ port: PORT, host: HOST })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
