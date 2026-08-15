# bun-elysia-backend

serve as API, based on bun + elysia + typescript.

由 `packages/bulin-express`（express.js + better-sqlite3）全盘迁移而来。

## 启动

```bash
# 开发（热重载）
pnpm --filter bun-elysia-backend dev

# 生产
pnpm --filter bun-elysia-backend start

# 类型检查
pnpm --filter bun-elysia-backend typecheck
```

服务默认监听 `http://localhost.bulin.com:3000`（可通过环境变量 `HOST` / `PORT` 覆盖）。

## 接口一览（与原项目保持一致）

| 方法   | 路径               | 说明                                                        |
| ------ | ------------------ | ----------------------------------------------------------- |
| GET    | /                  | 注册页面（public/views/register.html）                      |
| GET    | /creditInfo        | 卡信息列表（creditInfoTable.json）                          |
| POST   | /creditInfo        | 新增卡信息（原项目为桩代码，迁移后补齐为最小可用接口）      |
| GET    | /customerInfo      | 客户列表（chinook.db，支持 name/address 过滤、分页）        |
| PUT    | /customerInfo      | 更新客户（query 传参，firstName/lastName 必填）             |
| DELETE | /customerInfo      | 删除客户（query 传 customerId）                             |
| POST   | /upload            | 文件上传（multipart，字段名 file，上限 50MB）               |
| DELETE | /upload/:fileId    | 删除已上传文件目录                                          |
| GET    | /myPoster/list     | 在线海报图层数据（layerData.json）                          |
| GET    | /images/list       | 图片墙列表（读取 public/images 目录 + 分页）                |

## 技术映射

| bulin-express        | bun-elysia-backend                              |
| -------------------- | ----------------------------------------------- |
| express              | elysia                                          |
| express.static       | @elysiajs/static                                |
| express-session      | 自实现轻量 session 插件（src/plugins/session.ts）|
| bodyParser           | Elysia 内置解析                                 |
| express-fileupload   | Elysia 原生 multipart（t.File）                 |
| better-sqlite3       | bun:sqlite（Bun 内置）                          |
| chalk                | 原生 ANSI 转义码（src/utils/index.ts）          |
| uuid                 | crypto.randomUUID()（内置）                     |
| lodash/camelCase     | 自实现 camelCase（src/utils/index.ts）          |

## 说明

- `bun:sqlite` 命名参数绑定时，对象 key 需携带与 SQL 一致的前缀，如 `{ '@customerId': 1 }`
- 原项目 `src/tools/databasetool.js`（MongoDB）为死代码：未安装 mongodb 依赖且无任何调用方，未迁移
- 原项目 `database/images.json`、`database/picturesList.json` 无任何代码引用，未迁移
