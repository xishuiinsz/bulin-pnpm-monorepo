/**
 * 轻量级 session 插件（迁移自原项目的 express-session 配置）
 * - Cookie 名 connect.sid，值格式 s:<sessionId>.<HMAC-SHA256 签名>
 * - secret: 'keyboard cat'，cookie maxAge: 600000ms
 * - 等价 saveUninitialized: false（空会话不落库、不下发 Cookie）
 * - 内存存储（Map），写入时自动清理过期条目
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { Elysia } from 'elysia'

const COOKIE_NAME = 'connect.sid'
const SECRET = 'keyboard cat'
const MAX_AGE_MS = 600_000

export type SessionData = Record<string, unknown>

interface SessionEntry {
  data: SessionData
  expiresAt: number
}

const store = new Map<string, SessionEntry>()

const sign = (value: string): string =>
  createHmac('sha256', SECRET).update(value).digest('base64url')

const unsign = (signed: string): string | null => {
  const index = signed.lastIndexOf('.')
  if (index < 0) return null
  const value = signed.slice(0, index)
  const sigBuffer = Buffer.from(signed.slice(index + 1))
  const expBuffer = Buffer.from(sign(value))
  if (sigBuffer.length !== expBuffer.length) return null
  return timingSafeEqual(sigBuffer, expBuffer) ? value : null
}

const cleanExpired = (): void => {
  const now = Date.now()
  for (const [id, entry] of store) {
    if (entry.expiresAt <= now) store.delete(id)
  }
}

export const sessionPlugin = () =>
  new Elysia({ name: 'bun-elysia-session' })
    .derive({ as: 'global' }, ({ cookie }) => {
      const raw: unknown = cookie[COOKIE_NAME]?.value
      let sessionId: string | null = null
      let session: SessionData = {}
      if (typeof raw === 'string' && raw.startsWith('s:')) {
        const id = unsign(raw.slice(2))
        if (id) {
          const entry = store.get(id)
          if (entry && entry.expiresAt > Date.now()) {
            sessionId = id
            session = entry.data
          }
          else if (entry) {
            store.delete(id)
          }
        }
      }
      return { session, sessionId }
    })
    .onAfterHandle({ as: 'global' }, ({ cookie, session, sessionId }) => {
      // 空会话不写入（等价 saveUninitialized: false）
      if (Object.keys(session).length === 0) return
      cleanExpired()
      const id = sessionId ?? randomUUID()
      store.set(id, { data: session, expiresAt: Date.now() + MAX_AGE_MS })
      cookie[COOKIE_NAME].set({
        value: `s:${id}.${sign(id)}`,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: MAX_AGE_MS / 1000,
      })
    })
