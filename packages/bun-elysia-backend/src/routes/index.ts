/**
 * 路由聚合（迁移自 bulin-express/src/routers/index.js）
 */
import { Elysia } from 'elysia'
import path from 'node:path'
import { countriesListRouter } from './countriesList'
import { creditInfoRouter } from './creditInfo'
import { customerInfoRouter } from './customerInfo'
import { imagesRouter } from './images'
import { myPosterRouter } from './myPoster'
import { uploadRouter } from './upload'

const VIEWS_DIR = path.join(import.meta.dirname, '../public/views')

export const appRouter = new Elysia()
  // 根路由：返回注册页面
  .get('/', () => Bun.file(path.join(VIEWS_DIR, 'register.html')))
  // 储蓄账号
  .use(creditInfoRouter)
  // 客户信息
  .use(customerInfoRouter)
  // 文件上传
  .use(uploadRouter)
  // 在线海报
  .use(myPosterRouter)
  // 图片墙
  .use(imagesRouter)
  // 国家列表
  .use(countriesListRouter)
