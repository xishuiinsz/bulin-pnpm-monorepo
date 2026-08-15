/**
 * 客户信息路由（迁移自 bulin-express/src/routers/customerInfo.js）
 */
import { Elysia, t } from 'elysia'
import {
  deleteCustomerInfo,
  getCustomerInfoList,
  updateCustomerInfo,
} from '../controllers/customerInfo.controller'

export const customerInfoRouter = new Elysia({ prefix: '/customerInfo' })
  // 获取客户信息列表（GET 调整为 POST，查询参数从 query 迁移至 body，支持 countryList 国家过滤）
  .post(
    '/',
    ({ body }) => getCustomerInfoList(body),
    {
      body: t.Object({
        pageIndex: t.Optional(t.Numeric()),
        pageSize: t.Optional(t.Numeric()),
        name: t.Optional(t.String()),
        address: t.Optional(t.String()),
        countryList: t.Optional(t.Array(t.String())),
      }),
    },
  )
  // 更新客户信息
  .put('/', ({ query }) => updateCustomerInfo(query))
  // 删除客户信息
  .delete('/', ({ query }) => deleteCustomerInfo(query))
