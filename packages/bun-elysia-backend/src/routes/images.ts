/**
 * 图片墙路由（迁移自 bulin-express/src/routers/images.js）
 */
import { Elysia } from 'elysia'
import { getImagesList } from '../controllers/images.controller'

export const imagesRouter = new Elysia({ prefix: '/images' })
  // 获取图片列表
  .get('/list', ({ query, request }) => {
    const hostname = new URL(request.url).hostname
    return getImagesList(query, hostname)
  })
