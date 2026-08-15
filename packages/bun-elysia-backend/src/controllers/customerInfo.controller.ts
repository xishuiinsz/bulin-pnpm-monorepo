/**
 * 客户信息控制器（迁移自 bulin-express/src/controllers/customerInfoController.js）
 * better-sqlite3 使用 bun:sqlite（Bun 内置）替代
 * 注意：bun:sqlite 命名参数绑定时，对象 key 需携带与 SQL 一致的 @ 前缀
 */
import { Database } from 'bun:sqlite'
import path from 'node:path'
import { camelCase, logRed } from '../utils'

const DB_FILE = path.join(import.meta.dirname, '../database/chinook.db')

interface CustomerInfo {
  customerId?: number
  firstName?: string
  lastName?: string
  company?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  email?: string
  [key: string]: unknown
}

interface CustomerMutationResult {
  code: '0' | '1'
  msg: string
}

const toCamelCaseKeys = (row: Record<string, unknown>): CustomerInfo => {
  const customerOption: CustomerInfo = {}
  for (const key in row) {
    if (Object.hasOwnProperty.call(row, key)) {
      customerOption[camelCase(key)] = row[key]
    }
  }
  return customerOption
}

/**
 * 获取客户信息列表数据
 */
export const getCustomerInfoList = (
  query: Record<string, string | undefined>,
): { list: CustomerInfo[], pageTotal: number } => {
  const { pageIndex = '1', pageSize = '10', name = '', address = '' } = query
  const pageNumber = Number(pageIndex) || 1
  const sizeNumber = Number(pageSize) || 10

  const db = new Database(DB_FILE)
  let customerInfo: CustomerInfo[]
  try {
    const sqlStr = 'SELECT * FROM customer ORDER BY customerId'
    const rows = db.prepare(sqlStr).all() as Record<string, unknown>[]
    customerInfo = rows.map(toCamelCaseKeys)
  }
  finally {
    db.close()
  }

  if (name.trim()) {
    const nameQuery = name.trim().toLowerCase()
    customerInfo = customerInfo.filter((customer) => {
      const firstName = String(customer.firstName ?? '').toLowerCase()
      const lastName = String(customer.lastName ?? '').toLowerCase()
      return (
        firstName.includes(nameQuery)
        || lastName.includes(nameQuery)
        || `${firstName} ${lastName}`.includes(nameQuery)
      )
    })
  }
  if (address.trim()) {
    const addressQuery = address.trim().toLowerCase()
    customerInfo = customerInfo.filter(customer =>
      String(customer.address ?? '').toLowerCase().includes(addressQuery),
    )
  }

  const pageTotal = customerInfo.length
  const list = customerInfo.slice(
    (pageNumber - 1) * sizeNumber,
    (pageNumber - 1) * sizeNumber + sizeNumber,
  )
  return { list, pageTotal }
}

/**
 * 更新客户信息列表数据
 */
export const updateCustomerInfo = (
  query: Record<string, string | undefined>,
): CustomerMutationResult => {
  const { customerId, firstName, lastName, company, address, city, state, country, email } = query
  const requiredFields: Record<'firstName' | 'lastName', string> = {
    firstName: '名字',
    lastName: '姓氏',
  }

  for (const field of Object.keys(requiredFields)) {
    if (!query[field]?.trim()) {
      return {
        code: '1',
        msg: `${requiredFields.firstName}及${requiredFields.lastName}不能为空`,
      }
    }
  }

  const db = new Database(DB_FILE)
  try {
    const sqlStr
      = 'UPDATE customer SET'
        + ' firstName = @firstName'
        + ', lastName = @lastName'
        + ', company = @company'
        + ', address = @address'
        + ', city = @city'
        + ', state = @state'
        + ', country = @country'
        + ', email = @email'
        + ' WHERE customerId = @customerId'
    const result = db.prepare(sqlStr).run({
      '@firstName': firstName ?? null,
      '@lastName': lastName ?? null,
      '@company': company ?? null,
      '@address': address ?? null,
      '@city': city ?? null,
      '@state': state ?? null,
      '@country': country ?? null,
      '@email': email ?? null,
      '@customerId': Number(customerId),
    })
    if (result && result.changes) {
      return { code: '0', msg: '更新成功' }
    }
    return { code: '1', msg: '更新失败' }
  }
  finally {
    db.close()
  }
}

/**
 * 删除客户信息列表数据
 */
export const deleteCustomerInfo = (
  query: Record<string, string | undefined>,
): CustomerMutationResult => {
  const { customerId } = query
  const db = new Database(DB_FILE)
  try {
    const sqlStr = 'DELETE FROM customer WHERE customerId = @customerId'
    const result = db.prepare(sqlStr).run({ '@customerId': Number(customerId) })
    if (result && result.changes) {
      return { code: '0', msg: '删除成功' }
    }
    return { code: '1', msg: '删除失败' }
  }
  catch (error) {
    logRed(error instanceof Error ? error.message : String(error))
    return { code: '1', msg: '删除失败' }
  }
  finally {
    db.close()
  }
}
