/**
 * 国家列表路由
 */
import { Elysia } from 'elysia'
import { queryCountriesList } from '../controllers/countriesList.controller'

export const countriesListRouter = new Elysia()
  // 查询国家列表（chinook.db Customer.Country 去重，支持 searchKey 模糊查询）
  .get('/queryCountriesList', ({ query }) => queryCountriesList(query))
