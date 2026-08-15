/**
 * 在线海报控制器（迁移自 bulin-express/src/controllers/myPosterController.js）
 */
import fs from 'node:fs'
import path from 'node:path'

const JSON_FILE = path.join(import.meta.dirname, '../database/layerData.json')

/**
 * 获取在线海报图层列表数据
 */
export const getLayerList = (): unknown => {
  const content = fs.readFileSync(JSON_FILE, 'utf-8')
  try {
    return JSON.parse(content)
  }
  catch {
    // 解析失败时返回原始文本（与原项目 res.send(content) 行为一致）
    return content
  }
}
