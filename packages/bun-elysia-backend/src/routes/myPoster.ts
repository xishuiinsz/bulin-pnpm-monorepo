/**
 * 在线海报路由（迁移自 bulin-express/src/routers/myPoster.js）
 */
import { Elysia } from 'elysia'
import { getLayerList } from '../controllers/myPoster.controller'

export const myPosterRouter = new Elysia({ prefix: '/myPoster' })
  // 获取在线海报图层列表
  .get('/list', () => getLayerList())
