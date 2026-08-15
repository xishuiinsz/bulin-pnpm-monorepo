/**
 * 客户信息路由（迁移自 bulin-express/src/routers/customerInfo.js）
 */
import { Elysia } from 'elysia'
import {
  deleteCustomerInfo,
  getCustomerInfoList,
  updateCustomerInfo,
} from '../controllers/customerInfo.controller'

export const customerInfoRouter = new Elysia({ prefix: '/customerInfo' })
  // 获取客户信息列表
  .get('/', ({ query }) => getCustomerInfoList(query))
  // 更新客户信息
  .put('/', ({ query }) => updateCustomerInfo(query))
  // 删除客户信息
  .delete('/', ({ query }) => deleteCustomerInfo(query))
