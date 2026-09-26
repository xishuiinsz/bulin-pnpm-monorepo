### 2026-09-26

- [x] 验证 useLinkUpSearch 基于年份的联动查询 hook
  - 相关代码路径: **packages\bulin-vue3-frontend\src\hooks\common.ts**
  - 功能约定：初始化时所有查询基于相同年份完成登记（handler 首次调用只登记、不回调，不产生多余查询）；任一成员改变年份即激活新查询，hook 先把 searchMap 中全部成员的年份同步为新值，再以新年份回调除发起者外的所有 handler，其余查询一并重查；同年份重复提交幂等不触发；年份经 String() 归一化比较，数字 / 字符串视为同一年（回调入参原样透传）；「先同步 map 再回调」保证 handler 在回调中再次登记不会级联成环；宿主组件卸载（onUnmounted）时清空映射。
  - 使用约束：hook 内部调用 onUnmounted，必须在组件 setup 上下文中调用；迟到登记的成员不会被主动同步到最新年份，需要业务保证初始化时各查询使用相同年份。
  - 相关能力：**Map 快照遍历、幂等短路防环、onUnmounted 生命周期清理、watch + ref 联动重查**。
  - 测试: **packages\bulin-vue3-frontend\src\hooks\common.test.ts**（Vitest 浏览器模式，14 个用例：初始化登记不触发、变更联动其余重查、发起者不重复回调、同年份幂等、任意成员可发起、数字/字符串年份归一、重入安全、迟到登记、卸载清理映射、多实例隔离，以及 3 个查询单元（year ref + watch→query）的组合闭环），全部通过。

### 2026-09-25

- [x] 将【客户表格】菜单项从左侧菜单的一级位置迁移至“表格专场”分组下
  - demo 路径：左侧菜单 > 表格专场 > 客户表格
  - 相关代码路径: **packages\bulin-vue3-frontend\src\components\Sidebar.vue**
  - 说明：路由 `/myComponents/customerTable`、页面组件 **src\views\CustomerTable** 均未改动，仅调整菜单挂载位置，原有链接与 e2e 用例不受影响。

- [x] 优化《多级表头表格》的合并单元格算法与编辑弹窗链路
  - demo 路径：左侧菜单 > 表格专场 > 多级表头表格
  - 组件路径: **packages\bulin-vue3-frontend\src\views\MultiHeaderTable\entry.vue**
  - 主要改动：`span-method` 从“渲染期读写模块级临时数组 + 硬编码行号 `[0, 1]` + 固定 `rowspan: 2`”改为“基于数据源预计算合并表（`computed` + `Map`）”，查表 O(1)、支持连续 N 行同值合并、重复渲染不残留脏状态；年龄列改为 `sortable: 'custom'` 并复用 **sortListByFeild** 自行排序，修复排序后合并单元格失效的问题；表格数据改用 `structuredClone` 本地副本，编辑保存回写行数据 + 成功提示 + 关闭弹窗（对齐【基础表格】的编辑约定），合并结果随数据变化自动重算。
  - 相关能力：**computed 预计算 + Map 查表、structuredClone 数据副本、sortable custom 与 sort-change、ElMessage**。

- [x] 修复《动态列》组件把 `children` / `slots` 透传到 DOM 引发的 Vue 告警
  - demo 路径：左侧菜单 > 表格专场 > 多级表头表格；左侧菜单 > 表格专场 > 基础表格
  - 组件路径: **packages\bulin-vue3-frontend\src\components\dynamic-columns\DynamicColumns.vue**
  - 问题：`children`（多级表头子列）、`slots`（自定义单元格）是列配置自有字段，el-table-column 并未把它们声明成 props，整份列配置被透传后，这两个字段会以 attrs 的形式落到 el-table-column render 出来的根 `div` 上，而 `div.children` 是只读属性，控制台报 `[Vue warn]: Failed setting prop "children" on <div>: value [object Object],[object Object] is invalid. TypeError: Cannot set property children of #<Element> which has only a getter`。
  - 主要改动：`children` 由组件消费为父列的默认插槽（递归渲染子列），`slots` 原样透传给 el-table-column（顺带修复【基础表格】里 `slots.default` 自定义单元格失效的问题）；模板从「函数式组件 + `v-bind="column"`」改为 `<component :is="renderColumn(column)">` 直接输出 el-table-column 的 vnode，避免无 props 声明的函数式组件把整份列配置作为 attrs 二次透传到根 div，同时 `key` 也能落到列本身（el-table-column 用它做 `rawColumnKey`）；`getConfig` 的返回值由「整体替换列 props」改为「合并覆盖」，避免只返回局部配置时把 `label` / `prop` 清空。
  - 相关能力：**h 渲染函数、attrs 透传（fallthrough）与 inheritAttrs、el-table-column 的插槽协议、递归渲染**。
  - 测试: **packages\bulin-vue3-frontend\src\components\dynamic-columns\DynamicColumns.test.ts**（Vitest 浏览器模式，9 个用例：告警回归、占位 div 属性断言、三级表头结构、自定义插槽、selection 列、getConfig 覆盖，以及 views\MultiHeaderTable 真实列配置的回归）。

### 2026-09-22

- [x] 自动生成的菜单支持按分组挂载，并将【卡片化表格】菜单项从“练习场”迁移至“表格专场”
  - demo 路径：左侧菜单 > 表格专场 > 卡片化表格
  - 相关代码路径: **packages\bulin-vue3-frontend\src\router\index.js**、**packages\bulin-vue3-frontend\src\components\Sidebar.vue**
  - 用法：在 **src\pages\xxx\page.ts** 中声明 `menuGroup`（如 `menuGroup: '表格专场'`），未声明时默认归入“练习场”。
  - 相关能力：**import.meta.glob、getMenuListByGroup 按分组取菜单数据**。

### 2025-12-29
- [x] 动态多级表头组件初步完成
  - demo 路径：左侧菜单 > 表格卖场 > 动态多级表头
  - 组件路径: **packages\bulin-vue3-frontend\src\views\MultiHeaderTable**
  - 相关能力：**h渲染函数、递归渲染**。

### 2025-12-27

- [x] 基于TS泛型，输出getItemByList工具纯函数
  - 函数功能：从列表中根据过滤条件获取单个对象
  - 组件路径: **packages\libc-shared\src\pure-function.ts**

### 2025-12-21

- [x] 基于Intl.NumberFormat API 实现数字格式化
  - demo 路径：左侧菜单 > 基础表格
  - 组件路径: **packages\bulin-vue3-frontend\src\views\tableBaseData\tableData.js**
  - 相关能力：**Intl.NumberFormat**。

### 2025-12-06

- [x] 手工实现表格展开与收起
  - demo 路径：左侧菜单 > 练习场 > 手工实现表格展开与收起
  - 组件路径: **packages\bulin-vue3-frontend\src\pages\table-expand-collapse\index.vue**
  - 相关能力：递归展开数组、倒序遍历、图标+tooltip与图标+label显示模式的动态切换。

### 2025-10-29

- [x] 原创性实现多数据源共享check树
  - demo 路径：左侧菜单 > 练习场 > 多数据源树
  - 组件路径: **packages\bulin-vue3-frontend\src\pages\multi-sources-trees\index.vue**

### 2025-10-21

- [x] 原创性实现ElDatePicker组件的shutcuts的回显能力
  - demo 路径：左侧菜单 > 练习场 >  Tabs嵌套
  - 组件路径: **packages\bulin-vue3-frontend\src\pages\nested-tabs\FormComp.vue**

### 2025-10-16

- [x] 原创性实现“带‘查看更多’交互的多行超长...文本”的组件
  - demo 路径：左侧菜单 - 基础表格
  - 组件路径: **packages\bulin-vue3-frontend\src\components\MultiTextWithMore.vue**

### 2025-10-08

- [x] 原创性实现“安全找茬”能力
  - demo 路径：左侧菜单 - 练习场 - 安全找茬
  - 组件路径: **packages\bulin-vue3-frontend\src\pages\safe-nitpicking\index.vue**

### 2025-10-05

- [x] 实现“五子棋”游戏，判定赢棋的逻辑来自GitHub Copilot
  - demo 路径：左侧菜单 - 练习场 - 五子棋
  - 组件路径: **packages\bulin-vue3-frontend\src\pages\five-in-a-row\index.vue**

### 2025-10-01

- [x] html+canvas原创性实现“拼图游戏”
  - demo 路径：左侧菜单 - 练习场 - 拼图游戏
  - 组件路径: **packages\bulin-vue3-frontend\src\pages\jigsaw-puzzle\index.vue**

### 2024-09-22

- [x] 通过拦截Echarts实例中setOption方法来实现图表中字体大小与屏幕大小自适应的能力。
  - demo 路径：左侧菜单 - 练习场 - echarts中Tip引入Vue组件
  - 组件路径: **src\views\EchartsAndVue\EchartsAndVue.vue**
  - 通用逻辑: **src\echarts\index.js**

### 2024-09-20

- [x] 新增输入表单模拟器组件，尝试解决当表格中渲染大批量表单组件时不流畅的问题。
  - demo 路径：左侧菜单 - 练习场 - 表格中渲染大量输入框
  - 组件路径: **src\pages\massInputsInTable\InputSimulator.vue**

### 2024-08-18

- [x] 新增命令式 ElDrawer 能力
  - demo 路径：左侧菜单 - 基础表格 - 【用户名】列
  - 组件路径: **src\imperatives\showDrawer.js**

### 2024-07-27

- [x] 数据删除动画
  - demo 路径：左侧菜单 - 练习场 - 数据删除动画
  - 组件路径: **src\pages\animationByRemEle**
  - 此 demo 需要开启**https://github.com/xishuiinsz/bulin-express.git**后台工程配合实现效果。

### 2024-07-20

- [x] 调试并封装一种文本省略号不在尾部的 UI 效果。
  - demo 路径：左侧菜单 - 练习场 - 多行文本尾部的加载更多
  - 组件路径: **src\imperatives\src\components\loadMoreAfterTail.vue**

### 2024-07-14

- [x] 优化命令式 ElTooltip 能力
  - demo 路径：左侧菜单 - 练习场 - js 调用 Tooltip
  - 组件路径: **src\imperatives\showTooltip.js**
  - 优化【消除body上的zoom导致的tooltip错位】- 20240828

### 2024-07-13

- [x] 优化命令式 ElDialog 能力
  - js 和 jsx 版本同时提供
  - 另起 app 用来挂载 Eldialog，以确保 devTools 能调试它。 - 20240717
  - demo 路径：左侧菜单 - 基础表格 - 操作 - 编辑
  - 组件路径: **src\imperatives\showDialog.jsx**

### 2024-07-06

- [x] 优化『结构化表单』组件
  - 增加表单项校验能力
  - 补充作用域插槽能力
  - 将【重置】表单的能力挂载在表单实例上。
  - demo 路径：左侧菜单 - 表单相关 - 结构化表单
  - 组件路径: **src\components\structuredForm\entry.jsx**

### 2024-07-05

- [x] 卡片化 el-table 表格组件，某项目组的需求从标准化的 table 变更为卡片化的 table.
  - 完善了卡片化风格，借用 el-table--scrollable-y 类名、has 伪类选择器实现了分页器的动态 shadow 效果。- 20240726
  - demo 路径：左侧菜单 - 表格专场 - 卡片化表格
  - 组件路径: **src\assets\css\el-table.scss**

### 2024-07-04

- [x] 新增基于**src\pages**文件夹结构自动生成路由条目之能力
  - 相关代码路径: **src\router\index.js**

### 2024-07-03

- [x] 封装简易、手工版本的轮播组件
  - demo 路径：左侧菜单 - 练习场 - 走马灯
  - 组件路径: **src\pages\carouselDemo\components\multiItemsCarouse.vue**

### 2024-03-24

- [x] 基于阿里云【数据可视化平台 DataV.GeoAtlas】制作中国地图
  - 遭遇调用 JSON API 时报 403 错误，解决方法为：在 html 的请求头标签中加上<meta name=”referrer” content=”no-referrer”>
  - 以上解决方法请参考[博文](https://www.pipipi.net/20626.html)
  - 如果处理“南海诸岛”的视觉问题，参考[博文](https://blog.csdn.net/n_2021/article/details/132836912)
  - 组件组件 demo 源码：src\views\echarts\chinaMap.vue
  - 组件组件 demo 菜单路径：基础表格

### 2024-03-02

- [x] 基于 el-table，二次高度封装的结构化表格组件已基本成型。
  - 组件组件 demo 源码：src\views\tableBaseData
  - 组件组件 demo 菜单路径：echarts 图表 - 中国地图

### 2024-03-02

- [x] 基于 el-form，二次高度封装的结构化表单组件已基本成型。
  - 组件路径：src\components\structuredForm
  - 组件组件 demo 源码：src\views\formBaseData
  - 组件组件 demo 菜单路径：表单相关 -> 结构化表单组件

### 2024-02-16

- [ ] 使用 vue-pdf-embed(pdf 预览)的打印解决方案

### 2022-08-19

#### 新特性

- 增加对 sass 语法的支持

### 2022-08-18

#### 新特性

- 在 vue3 中解析 markdown 文件
  - 基于 marked、highlight.js 等插件,
  - 摘录代码如下
  ```javascript
  import logsMarkdown from '@/logs.md?raw';
  import { marked } from 'marked';
  const logs = ref('');
  onMounted(() => {
    logs.value = marked(logsMarkdown);
  });
  ```
