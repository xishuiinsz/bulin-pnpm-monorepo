/**
 * 通用工具函数（迁移自 bulin-express/src/utils/index.js）
 * chalk 使用原生 ANSI 转义码替代（零依赖）
 */

/** 服务主机与端口（与原项目保持一致，可通过环境变量覆盖） */
export const APP_HOST = process.env.HOST ?? 'localhost.bulin.com'
export const APP_PORT = Number(process.env.PORT ?? 3000)

const wrap
  = (open: string, close = '39') =>
    (text: string): string =>
      `\u001B[${open}m${text}\u001B[${close}m`

const red = wrap('31')
const redBrightBold = wrap('91;1', '0')
const yellow = wrap('33')
const green = wrap('32')
const greenBold = wrap('32;1', '0')

/** 红色字体输出 */
export const logRed = (str: string): void => {
  console.log(`${red('!!!')} ${redBrightBold(str)} ${red('!!!')}`)
}

/** 黄色字体输出 */
export const logYellow = (str: string): void => {
  console.log(`${yellow('!!')} ${yellow(str)} ${yellow('!!')}`)
}

/** 绿色字体输出 */
export const logGreen = (str: string): void => {
  console.log(`${green('###')} ${greenBold(str)} ${green('###')}`)
}

/** [min, max] 区间内的随机整数 */
export const getRangeInteger = (min: number, max: number): number => {
  if (min > max) {
    ;[min, max] = [max, min] // 交换
  }
  min = Math.floor(min)
  max = Math.ceil(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 驼峰命名转换（替代原项目的 lodash/camelCase）
 * 用于把 SQLite 列名转换为前端字段名，如 CustomerId -> customerId
 */
export const camelCase = (str: string): string => {
  const normalized = str
    .replace(/[\s_-]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[\s_-]+/g, '')
  return normalized.charAt(0).toLowerCase() + normalized.slice(1)
}
