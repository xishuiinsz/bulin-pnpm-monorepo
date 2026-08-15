/**
 * 文件上传控制器（迁移自 bulin-express/src/controllers/uploadController.js）
 * express-fileupload 使用 Elysia 原生 multipart 解析替代
 * uuid 使用 Bun 内置 crypto.randomUUID() 替代
 */
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const UPLOADS_DIR = path.join(import.meta.dirname, '../public/uploads')

interface UploadResponse {
  code: string
  msg: string
  uuid?: string
  name?: string
}

interface DeleteResult {
  status: number
  body: UploadResponse
}

/**
 * 文件上传
 */
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const uuid = randomUUID()
  const name = file.name
  // 新增目录
  const dirPath = path.join(UPLOADS_DIR, uuid)
  fs.mkdirSync(dirPath, { recursive: true })
  const targetPath = path.join(dirPath, name)
  await Bun.write(targetPath, file)
  return {
    code: '0',
    msg: '上传成功',
    uuid,
    name,
  }
}

/**
 * 文件删除
 */
export const deleteFile = (fileId: string): DeleteResult => {
  if (!fileId || !fileId.trim()) {
    return { status: 400, body: { code: '1', msg: '文件ID不能为空' } }
  }
  const dirPath = path.join(UPLOADS_DIR, fileId)
  if (!fs.existsSync(dirPath)) {
    return { status: 400, body: { code: '1', msg: '目录不存在' } }
  }
  try {
    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      fs.unlinkSync(path.join(dirPath, file))
    }
    fs.rmdirSync(dirPath)
    return { status: 200, body: { code: '0', msg: '删除文件成功' } }
  }
  catch (error) {
    return {
      status: 500,
      body: { code: '1', msg: error instanceof Error ? error.message : String(error) },
    }
  }
}
