/**
 * 国家列表控制器
 * 数据源：chinook.db 的 Customer 表 Country 字段（去重）
 * better-sqlite3 使用 bun:sqlite（Bun 内置）替代
 */
import { Database } from 'bun:sqlite'
import path from 'node:path'
import { logRed } from '../utils'

const DB_FILE = path.join(import.meta.dirname, '../database/chinook.db')

interface CountriesListResponse {
  list: string[]
  total: number
}

/**
 * 查询国家列表（去重）
 * 支持 searchKey 模糊查询（不区分大小写的包含匹配）
 */
export const queryCountriesList = (
  query: Record<string, string | undefined>,
): CountriesListResponse => {
  const { searchKey = '' } = query
  const db = new Database(DB_FILE)
  try {
    const sqlStr
      = 'SELECT DISTINCT Country'
        + ' FROM Customer'
        + ' WHERE Country IS NOT NULL'
        + ' ORDER BY Country ASC'
    const rows = db.prepare(sqlStr).all() as { Country: string }[]
    let list = rows.map(row => row.Country)
    if (searchKey.trim()) {
      const searchQuery = searchKey.trim().toLowerCase()
      list = list.filter(country => country.toLowerCase().includes(searchQuery))
    }
    return { list, total: list.length }
  }
  catch (error) {
    logRed(error instanceof Error ? error.message : String(error))
    return { list: [], total: 0 }
  }
  finally {
    db.close()
  }
}
