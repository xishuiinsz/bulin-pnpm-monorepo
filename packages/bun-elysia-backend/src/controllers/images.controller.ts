/**
 * 图片墙控制器（迁移自 bulin-express/src/controllers/imagesController.js）
 */
import fs from 'node:fs'
import path from 'node:path'
import { APP_PORT, logRed } from '../utils'

const IMAGES_DIR = path.join(import.meta.dirname, '../public/images')

interface ImageItem {
  name: string
  size: number
  url?: string
}

interface ImagesResponse {
  code: string
  msg: string
  total: number
  data: ImageItem[]
}

/**
 * 获取图片列表数据
 */
export const getImagesList = (
  query: Record<string, string | undefined>,
  hostname: string,
): ImagesResponse => {
  const { pageIndex = '1', pageSize = '15' } = query
  const pageNumber = Number(pageIndex) || 1
  const sizeNumber = Number(pageSize) || 15
  try {
    const files = fs.readdirSync(IMAGES_DIR)
    const list: ImageItem[] = files.map(file => ({
      name: file,
      size: fs.statSync(path.join(IMAGES_DIR, file)).size,
    }))
    const total = list.length
    const data = list
      .slice((pageNumber - 1) * sizeNumber, pageNumber * sizeNumber)
      .map(item => ({ ...item, url: `//${hostname}:${APP_PORT}/images/${item.name}` }))
    return { code: '0', msg: '查询成功', total, data }
  }
  catch (error) {
    logRed(error instanceof Error ? error.message : String(error))
    return { code: '1', msg: '查询失败', total: 0, data: [] }
  }
}
