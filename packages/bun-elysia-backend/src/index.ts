/**
 * 应用入口（迁移自 bulin-express/src/app.js）
 *
 * 技术栈映射：
 * - express              -> elysia
 * - express.static       -> @elysiajs/static
 * - express-session      -> src/plugins/session.ts（自实现轻量版）
 * - bodyParser           -> Elysia 内置（自动解析 application/json、x-www-form-urlencoded）
 * - express-fileupload   -> Elysia 原生 multipart 解析（t.File）
 * - better-sqlite3       -> bun:sqlite（Bun 内置）
 */
import staticPlugin from '@elysiajs/static'
import { Elysia } from 'elysia'
import path from 'node:path'
import { sessionPlugin } from './plugins/session'
import { appRouter } from './routes'
import { APP_HOST, APP_PORT, logGreen } from './utils'

const PUBLIC_DIR = path.join(import.meta.dirname, 'public')

const app = new Elysia()
  // session 中间件（等价 express-session）
  .use(sessionPlugin())
  // 静态资源根目录（等价 express.static，bodyParser 能力为 Elysia 内置）
  .use(staticPlugin({ assets: PUBLIC_DIR, prefix: '/' }))
  // 注册路由
  .use(appRouter)

// 启动
app.listen({ hostname: APP_HOST, port: APP_PORT }, (server) => {
  logGreen(`server [${server.hostname}] is starting successfully on port:${server.port}`)
})

export type App = typeof app
