/**
 * 卡信息路由（迁移自 bulin-express/src/routers/creditInfo.js）
 */
import { Elysia } from 'elysia'
import { addCreditInfo, getCreditInfoList } from '../controllers/creditInfo.controller'

export const creditInfoRouter = new Elysia({ prefix: '/creditInfo' })
  // 获取卡信息列表
  .get('/', () => getCreditInfoList())
  // 新增一条卡信息
  .post('/', ({ body }) => addCreditInfo(body))
