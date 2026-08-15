/**
 * 文件上传路由（迁移自 bulin-express/src/routers/upload.js）
 * 文件大小上限 50MB，与原项目 express-fileupload limits.fileSize 保持一致
 */
import { Elysia, t } from 'elysia'
import { deleteFile, uploadFile } from '../controllers/upload.controller'

export const uploadRouter = new Elysia({ prefix: '/upload' })
  // 文件上传
  .post(
    '/',
    ({ body }) => {
      if (!body.file) {
        return new Response('上传文件为空', { status: 400 })
      }
      return uploadFile(body.file)
    },
    {
      body: t.Object({
        file: t.Optional(t.File({ maxSize: '50m' })),
      }),
    },
  )
  // 文件删除
  .delete('/:fileId', ({ params, set }) => {
    const result = deleteFile(params.fileId)
    set.status = result.status
    return result.body
  })
