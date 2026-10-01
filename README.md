# Monorepo 和 Multirepo
单一仓库（Monorepo）架构，可以理解为：**利用单一仓库来管理多个packages的一种策略或手段**；与其相对的是多仓库（Multirepo）架构

Monorepo 目录中除了会有公共的`package.json`依赖以外，在每个`sub-package`子包下面，也会有其特有的`package.json`依赖。

**兄弟模块之间可以通过模块`package.json` 定义的 `name` 相互引用，保证模块之间的独立性**
```shell
# monorepo目录结构
monorepo-demo
├── packages
│   ├─ module-a
│   │  ├─ src             # 模块 a 的源码
│   │  ├─ node_modules    # 模块 a 的 node_modules
│   │  └─ package.json    # 仅模块 a 的依赖
│   └─ module-b
│      ├─ src             # 模块 b 的源码
│      └─ package.json    # 仅模块 b 的依赖
├── .eslintrc             # 配置文件，对整个项目生效
├── node_modules          # 所有子包公共的 node_modules
└── package.json          # 所有子包公共的依赖
```
Multirepo 更倾向与在项目制中，将一个个项目使用不同的仓库进行隔离，每一个项目下使用独有的`package.json`来管理依赖
```shell
# multirepo-a目录结构
multirepo-a
├── src
├── .eslintrc                
├── node_modules             
└── package.json   

# multirepo-b目录结构
multirepo-b
├── src
├── .eslintrc                
├── node_modules             
└── package.json  
```
# Monorepo 工具
在采用 Monorepo（单一仓库）架构的软件开发中，工具的选择是至关重要的。合适的 Monorepo 工具能够帮助团队更高效地管理大规模代码库、提升协同开发体验以及优化构建和部署流程。

直至 2024 年，目前在前端界比较流行的 Monorepo 工具有 `Pnpm Workspaces`、`Yarn Workspaces`、`npm Workspaces`、`Rush`、`Turborepo`、`Lerna`、`Yalc`、和 `Nx`

**强烈推荐使用`Pnpm Workspaces` 作为 Monorepo 项目的依赖管理工具**😍😍😍
**那么 Monorepo 与包管理工具（npm、yarn、pnpm）之间是一种怎样的关系？**
> 这些包管理工具与 monorepo 的关系在于，它们可以为 monorepo 提供依赖安装与依赖管理的支持，借助自身对 workspace 的支持，允许在 monorepo 中的不同子项目之间共享依赖项，并提供一种管理这些共享依赖项的方式，这可以简化依赖项管理和构建过程，并提高开发效率。

# Monorepo 项目搭建
## 背景
传统的多仓库 Multirepo 模式，通常都是一个仓库存放一个项目。比如现在你有三个项目，就需要创建三个远程仓库，并且需要为每个项目单独安装和升级依赖

而单一仓库 Monorepo 模式，就是在一个仓库中管理多个项目，这些项目可以是独立的，也可以相互依赖。通过 Monorepo，多个项目可以共享依赖。比如多个项目都需要 `lodash`，那我们也只需安装一次即可
```shell
pnpm i lodash -w
```
当然，Monorepo 中除了公共的`package.json`依赖以外，在每个`sub-package`子包下面，也会有其私有的`package.json`依赖
我们本次选择`Pnpm Workspaces` 作为 Monorepo 项目的依赖管理工具，一起来搭建一个 `monorepo` 项目✨
## 安装包管理工具  
全局安装 pnpm
```shell
npm i pnpm -g
```
## 初始化项目
创建一个新的项目目录 `pnpm-monorepo`，根目录运行 `pnpm init` 创建 `package.json` 文件

然后根目录新建一个文件夹 `packages`，用于存储子包

新建 `packages/libc-shared`（ 共享包 ），用于存放多个项目或组件之间共享的代码 。运行 `pnpm init` 创建 `package.json` 文件，**修改 `package.json` 的 name 为 `"@libc/shared"`；修改 `package.json` 的 main 入口文件路径字段为`"src/index.js"`**
```shell
{
  "name": "@libc/shared",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
}
```
新建 `packages/libc-ui`（ 公共组件包 ），即UI组件库，这里我们直接 clone 了 `[iview-ui-plus](https://github.com/view-design/ViewUIPlus)` 代码。运行 `pnpm install` 安装依赖，，**修改 `package.json` 的 name 为 `"@libc/ui"`；修改 `package.json` 的 main 入口文件路径字段为`"src/index.js"`**

然后我们在 `packages`下创建两个 vue 项目，`vue-dom1` 和 `vue-dom2`，运行脚本`pnpm create vue@latest`。由于两个项目的依赖是完全一样的，我们可以将 `dependencies`、`devDependencies`复制到外层 `package.json` 中当做公共依赖，然后`pnpm install` 安装一次即可

**到了这一步，vue 项目还是不能运行，必须要先配置 workspace，用于支持多包存储库**💥**让子包 vue 项目可以访问到我们的公共依赖💥💥**
## 配置workspace
根目录新建一个 `pnpm-workspace.yaml`，将 packages 下所有的目录都作为包进行管理💥💥💥
```shell
packages:
  # all packages in direct subdirs of packages/
  - 'packages/*'
```
`pnpm-monorepo` 最终项目结构
```shell
pnpm-monorepo/
├── packages/
│   ├── libc-shared/
│   ├── libc-ui/
├── package.json
└── pnpm-workspace.yaml
```
## 子包共享💥
此时，`pnpm-workspace.yaml`工作空间下的每个子包都可以共享我们的公共依赖了。还有个问题是，兄弟模块之间如何共享呢？

**之前我们说过，子包之间可以通过 `package.json` 定义的 `name` 相互引用，一起看下两个实际场景**

1. **如何把子包 libc-shared 共享出去？**

用`--workspace`参数去安装共享子包，会去 workspace工作空间中找依赖项并安装
```shell
pnpm install @libc/shared --workspace -w
```
`package.json` 中就会自动添加如下依赖，`"workspace:"` 只会解析本地 workspace 包含的 package
```shell
 "dependencies": {
    "@libc/shared": "workspace:^"
  }
```
此时，vue 项目就可以使用公共包 `libc-shared` 里的方法，import 引入即可
```shell
import { isObject } from '@libc/shared'
```

2. **如何把子包 libc-ui 共享出去？**

重复一下上面的步骤，然后我们去引用一个 `button`组件，发现报错了`Failed to resolve import "./base" from "../libc-ui/src/components/typography/title.vue". Does the file exist?`

 `vite.config.js` 中添加 `extensions` 即可解决，配置一下省略的扩展名列表
```shell
resolve: {
  extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
}
```
虽然 `button` 组件引用成功了，但是发现没有任何样式效果。在`libc-ui/src/index.js` 文件中导入一下样式文件就行了
```shell
import "./styles/index.less";
```
## 公共依赖
全局安装公共依赖 `lodash`。需要加`-w`（在工作空间的根目录中启动 pnpm）
```shell
pnpm install lodash -w
```
这样，`vue-dom1` 和 `vue-dom2` 这两个 vue项目就都可以使用 `lodash` 库了
## 局部依赖
如果只有 `vue-dom1` 项目用到了 `lodash`，我们也可以安装到`vue-dom1` 项目内部，不作为公共依赖项，有两种方法可以实现

1. cd 到 `src/packages/vue-dom1`目录下，直接安装
```shell
pnpm install lodash
```

2. 在任意目录下，使用 `--filter` 参数进行安装
```shell
pnpm install lodash --filter vue-demo1
```
# 配套代码
[GitHub - burc-li/pnpm-monorepo: vue3 + pnpm + monorepo 项目 demo 🍎](https://github.com/burc-li/pnpm-monorepo)

# 参考文档
[为什么 pnpm+monorepo 是组件库项目的最佳实践](https://juejin.cn/post/7316409548994625574)

[突破项目瓶颈：2024 年 Monorepo 工具选择和实践 | BEEZEN](https://dongbizhen.com/posts/48225/#2%E3%80%81Changesets)

[GitHub - Tyh2001/vue3-pnpm-monorepo: 🐠 vue3 + pnpm + monorepo 项目 demo](https://github.com/Tyh2001/vue3-pnpm-monorepo)
