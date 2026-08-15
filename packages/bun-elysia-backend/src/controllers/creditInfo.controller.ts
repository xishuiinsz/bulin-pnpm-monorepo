/**
 * 卡信息控制器（迁移自 bulin-express/src/controllers/creditInfoController.js）
 */
import fs from 'node:fs'
import path from 'node:path'

const JSON_FILE = path.join(import.meta.dirname, '../database/creditInfoTable.json')

interface ApiResponse {
  code: string
  msg: string
}

/**
 * 获取卡信息列表数据
 */
export const getCreditInfoList = (): unknown => {
  const content = fs.readFileSync(JSON_FILE, 'utf-8')
  try {
    return JSON.parse(content)
  }
  catch {
    // 解析失败时返回原始文本（与原项目 res.send(content) 行为一致）
    return content
  }
}

/**
 * 新增一条卡信息
 * 原实现为未完成桩代码（仅 console.log(req)，不响应请求）；
 * 迁移后补齐为最小可用接口：记录请求体并返回成功回执
 */
export const addCreditInfo = (body: unknown): ApiResponse => {
  console.log(body)
  return { code: '0', msg: '新增成功' }
}
