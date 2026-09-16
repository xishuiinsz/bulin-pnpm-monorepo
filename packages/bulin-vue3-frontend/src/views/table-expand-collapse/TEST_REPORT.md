# 测试报告：表格手工展开 / 收起（handleExpand、handleCollapse）

| 项目 | 内容 |
| --- | --- |
| 被测组件 | `packages/bulin-vue3-frontend/src/pages/table-expand-collapse/index.vue` |
| 被测函数 | `handleExpand(row)`、`handleCollapse(row)`，及其关联的 `getRowKey` / `flatMapAll` / `getExpandedRows` / 模板图标判定 |
| 测试文件 | `packages/bulin-vue3-frontend/src/pages/table-expand-collapse/index.test.ts` |
| 报告日期 | 2026-09-11 |
| 代码基线 | git HEAD `1728d14`（2026-09-04）；本次改动位于工作区（已暂存，未提交） |
| 最终结论 | **通过**：修复前复现 4 个缺陷 + 1 个副作用；修复后 **22 个用例全部通过（0 失败 / 0 跳过 / 0 待执行）** |

## 1. 测试环境

| 项 | 版本 / 说明 |
| --- | --- |
| 操作系统 | Microsoft Windows 11 家庭版 中文版 |
| Node.js | v22.22.0 |
| 包管理 | pnpm 10.28.1（monorepo，`shamefully-hoist=false`） |
| 测试框架 | Vitest 4.0.16（Browser Mode） |
| 浏览器 | @vitest/browser-playwright + Playwright 1.49.1，Chromium（chromium-1148，headless） |
| 挂载工具 | vitest-browser-vue 2.0.1（内部使用 @vue/test-utils） |
| 被测运行时 | Vue 3.5.13 + Element Plus 2.10.5 |
| 配置文件 | `packages/bulin-vue3-frontend/vitest.config.ts` |

## 2. 测试范围

**在范围内**

- `handleExpand` / `handleCollapse` 的行为正确性、幂等性、边界与健壮性；
- 两者共同依赖的 `getRowKey`（唯一标识策略）、`flatMapAll`（子孙收集）、`getExpandedRows`（编辑后重建表格）；
- 视图一致性：表格实际渲染的行与顺序、`level-*` 缩进类名、`+` / `-` 图标状态、`expandedRowKeys` 状态。

**不在范围内**

- `handleEdit` 弹窗流程（`@/imperatives/showDialog` 在测试中被 mock）；
- `spanMethod` 首列合并与 `FirstColumn.vue` 的尺寸 / 视觉计算；
- 接口数据、路由、样式与跨浏览器兼容（仅 Chromium）。

## 3. 测试策略

不做"复制一份逻辑再测"，而是在真实浏览器中挂载真实组件：

1. **用户视角**：定位表格行内的 `+` / `-` svg 图标，`dispatchEvent(new MouseEvent('click', { bubbles: true }))`，走模板上真实绑定的 `handleExpand` / `handleCollapse`；
2. **函数视角**：通过 `el.__vueParentComponent.setupState` 取得组件内部的 `tableData`、`expandedRowKeys` 与两个函数本体，做重复调用、非法入参、叶子行入参等白盒验证；
3. **双向断言**：每个用例同时校验「DOM 渲染结果」与「组件状态」，任一不一致即判失败；异步渲染统一用 `vi.waitFor` 收敛，避免时序抖动。

> 实现细节：首列会被 `span-method` 合并，被合并的行少一个 `td`，因此统一用 `td div.d-flex.align-items-center` 定位姓名列；`+` / `-` 图标以初始状态捕获的 Plus `path[d]` 作为基准进行比对。


## 4. 第一阶段：修复前的缺陷验证

该阶段共 17 个用例：13 个「现状刻画」用例（断言当前真实行为，全部通过 ⇒ 缺陷成立）+ 4 个 `test.fails`「期望行为」用例（如期失败 ⇒ 缺陷成立）。**结果：4 个缺陷 + 1 个副作用全部复现。**

### 缺陷 1（严重）：收起一棵树会误删另一棵树的展开状态

- **触发路径**：展开「张三丰」→ 展开「李世民」→ 收起「张三丰」（纯 UI 操作即可复现）
- **根因**：`handleCollapse` 中 `expandedRowKeys.splice(expandedRowKeys.indexOf(element.id), 1)`。被删除的子孙若「有 `childrenList` 但从未被展开」（如李泽楷），`indexOf` 返回 **-1**，而 `splice(-1, 1)` 会删掉数组**最后一个**元素，即无关的「李世民」的 key
- **实测**：`expandedRowKeys` 变为 `[]`，但李世民的 3 个子行仍渲染在表格中；其图标退化为 `+`（状态与视图不一致）
- **连锁后果**：再点一次这个错误的 `+` ⇒ `handleExpand` 重复插入，「李想啥 / 李泽楷 / 李是谁」各出现 2 次，`row-key` 重复

### 缺陷 2：`handleExpand` 非幂等

- **根因**：`includes` 判断只保护了 `expandedRowKeys.push`，其后的 `tableData.splice(index + 1, 0, ...)` 没有任何保护
- **实测**：同一帧内连续两次点击 `+`（Vue 尚未重渲染，图标仍是 `+`），或直接连续调用两次 `handleExpand(row)` ⇒ 子行重复插入，表格由 5 行变 8 行，而 key 只记录 1 次

### 缺陷 3：定位失败时静默插到表头

- **根因**：`const index = tableData.findIndex(item => item.id === row.id)` 未校验 `-1`，`splice(-1 + 1, 0, ...)` 等价于 `splice(0, 0, ...)`
- **实测**：传入不在 `tableData` 中的行 ⇒ 子行被插到表格**第一行**，且 key 照样写入

### 缺陷 4：与 `getRowKey` 兜底策略不一致（无 id 的行）

- **根因**：`getRowKey` 为无 id 行提供了 `slogan + surname` 兜底，但两个函数、`expandedRowKeys`、模板 `v-if`、`getExpandedRows` 全部直接使用 `row.id`
- **实测**：存在多个无 id 行时，`findIndex(item => item.id === undefined)` 命中**第一个**无 id 行 ⇒ 子行插错位置；`expandedRowKeys` 被塞入 `undefined` ⇒ **所有无 id 行同时显示为「已展开」**

### 副作用：行对象身份不稳定

- `row.childrenList = row.childrenList.map(...)` 每次展开都重建子节点对象，绑定到行对象的组件状态会丢失，并产生额外 GC 压力

## 5. 修复内容（`index.vue`）

| 对应缺陷 | 修复点 |
| --- | --- |
| 缺陷 1 | 删除子孙 key 前先判断 `indexOf > -1`；判定条件由「有没有 `childrenList`」改为「key 是否真的存在」（这才是该判断的本意） |
| 缺陷 2 | `expandedRowKeys.includes(rowKey)` 命中时**提前 return**，使 key 写入与行插入同时受保护，函数幂等 |
| 缺陷 3 | `index < 0` 时提前 return，不修改任何状态 |
| 缺陷 4 | 全链路统一使用 `getRowKey`：两个函数、`expandedRowKeys`、模板 `v-if`、`getExpandedRows` |
| 副作用 | 改为 `row.childrenList.forEach(item => { item.level = ... })` 就地写入 level，不再重建对象 |

配套改动：`vitest.config.ts` 补齐与 `vite.config.js` 一致的 `@/@a/@c/@h/@i/@p/@u/@v` 别名与 `vueJsx()` 插件（否则测试环境无法解析 `@/imperatives/showDialog`，且 `.jsx` 会被 tsconfig 的 `jsx: react-jsx` 导向不存在的 `react/jsx-runtime`）；`.gitignore` 忽略 `__screenshots__`。

## 6. 第二阶段：修复后的回归验证

执行时间 2026-09-11 21:51:00，执行命令见第 9 节。

```text
 RUN  v4.0.16  D:/coding/bulin-pnpm-monorepo/packages/bulin-vue3-frontend
 ✓ chromium  src/pages/table-expand-collapse/index.test.ts (22 tests)

 Test Files  1 passed (1)
      Tests  22 passed (22)        # 0 failed / 0 skipped / 0 todo
   Duration  ~3.6s（用例累计 2208.5 ms）
```

| # | 分组 | 用例 | 结果 | 耗时 |
| --- | --- | --- | --- | --- |
| 1 | 常规流程 | 展开根节点：子行按序插入父行之后，key 被记录，图标变为 - | ✅ | 112 ms |
| 2 | 常规流程 | 收起根节点：子孙行全部移除，key 被清空，图标恢复为 + | ✅ | 100 ms |
| 3 | 常规流程 | 展开二级节点：插入位置正确且 level 递增为 3 | ✅ | 106 ms |
| 4 | 常规流程 | 收起二级节点：只移除自己的子孙，父级展开状态不受影响 | ✅ | 106 ms |
| 5 | 常规流程 | 收起父节点：连带清理已展开子孙的 key 与行 | ✅ | 103 ms |
| 6 | 常规流程 | 反复展开/收起多轮：行与 key 始终一致（无残留、无重复） | ✅ | 193 ms |
| 7 | handleCollapse 回归（原缺陷1） | 收起一棵树不影响另一棵树的展开状态（key 与图标都保持） | ✅ | 113 ms |
| 8 | handleCollapse 回归（原缺陷1） | 收起第二棵树同样不影响第一棵树 | ✅ | 121 ms |
| 9 | handleCollapse 回归（原缺陷1） | 原「连锁重复插入」场景：图标仍是 -，再点一次即正常收起 | ✅ | 118 ms |
| 10 | handleExpand 回归（原缺陷2） | 同一帧内连续两次点击 +（Vue 尚未重渲染）不会重复插入子行 | ✅ | 87 ms |
| 11 | handleExpand 回归（原缺陷2） | 直接连续调用多次 handleExpand(row) 也是幂等的 | ✅ | 82 ms |
| 12 | handleExpand 回归（原缺陷2） | 连续调用多次 handleCollapse(row) 同样幂等，不会误删其它 key | ✅ | 103 ms |
| 13 | 边界与健壮性 | row 不在 tableData 中时直接返回，不改动表格与 key（原缺陷3） | ✅ | 63 ms |
| 14 | 边界与健壮性 | 对不存在于表格中的行调用 handleCollapse 也是安全的空操作 | ✅ | 89 ms |
| 15 | 边界与健壮性 | 对叶子行（无 childrenList）调用 handleExpand 是空操作 | ✅ | 79 ms |
| 16 | 边界与健壮性 | 对叶子行（无 childrenList）调用 handleCollapse 是空操作，不会误删已展开的 key | ✅ | 76 ms |
| 17 | 边界与健壮性 | 无 id 的行也能正确定位并独立展开（原缺陷4） | ✅ | 129 ms |
| 18 | 边界与健壮性 | 无 id 的行也能正确收起，且不影响其它无 id 行 | ✅ | 156 ms |
| 19 | 边界与健壮性 | 展开时就地写入 level，行对象身份保持稳定（原副作用） | ✅ | 82 ms |
| 20 | getExpandedRows | 按 key 还原已展开的行，并写入正确的 level | ✅ | 67 ms |
| 21 | getExpandedRows | 未展开的父节点不会带出子孙行 | ✅ | 64 ms |
| 22 | getExpandedRows | 无 id 的行也能按 getRowKey 还原展开状态 | ✅ | 61 ms |

**分组统计**：常规流程 6 / handleCollapse 回归 3 / handleExpand 回归 3 / 边界与健壮性 7 / getExpandedRows 3，合计 **22 通过、0 失败**。
**同包全量执行**（`vitest-example/HelloWorld.test.ts` + 本文件）：`Test Files 2 passed (2)`、`Tests 23 passed (23)`（本文件 22 + HelloWorld 1），说明配置改动未影响既有用例。


## 7. 分支覆盖分析（人工逐条核对）

> 仓库未安装 `@vitest/coverage-v8`，故无量化覆盖率数字；以下按分支逐条核对，标注覆盖用例编号。

**`handleExpand`（5 个判定点，全覆盖）**

| 判定点 | 覆盖用例 |
| --- | --- |
| `!row.childrenList?.length` 早退 | #15 |
| 已展开早退（幂等保护） | #10、#11 |
| `index < 0` 定位失败早退 | #13 |
| 正常插入路径（含多层级） | #1、#3、#17 |
| `row.level \|\| 1` 的两个取值（根节点无 level / 二级节点 level=2） | #1 / #3 |

**`handleCollapse`（4 个判定点，全覆盖）**

| 判定点 | 覆盖用例 |
| --- | --- |
| `!row.childrenList?.length` 早退 | #16 |
| `selfKeyIndex > -1` / `=== -1` | #2、#4 / #14 |
| `descendantKeys.includes` 命中 / 部分命中 / 全不命中 | #2 / #5、#7 / #14 |
| `keyIndex > -1` / `=== -1`（即原缺陷 1 的分支） | #5 / #7 |

**关联函数 `getExpandedRows`**：`shouldShow` 真/假、`expandedSet.has(getRowKey(node))` 命中/未命中、无 id 行 ⇒ #20、#21、#22。

**未覆盖（超出本次目标）**：`handleEdit` 弹窗 → 提交 → 重建表格的端到端链路（`showDialog` 被 mock）、`spanMethod` 与 `FirstColumn.vue` 的视觉合并、Element Plus 表格的内部布局行为。

## 8. 遗留风险与后续建议

1. **`getRowKey` 兜底仍可能重复**：兜底 key 为 `slogan + surname`，若出现同 slogan 且同 surname 的两行仍会冲突。建议后端保证 `id` 必填，或兜底时附加父级路径 / 索引。
2. **`handleCollapse` 的复杂度**：当前为「全表倒序扫描 + 按 key 删除」，O(n×m)。数据量大时建议改为「定位父行位置后，连续删除紧随其后的子孙块」。
3. **就地写入 `level` 的共享风险**：`handleExpand` 直接修改 `row.childrenList[i].level`。若同一份树数据被多个表格实例共享会互相影响；本页面的 `tableData` 由 `structuredClone(tableList)` 独立持有，当前无此问题。
4. **量化覆盖率**：建议安装 `@vitest/coverage-v8`，并补 `handleEdit → submit` 的端到端用例（需解除 `showDialog` mock 或将其改为可注入）。
5. **配置冗余**：`packages/bulin-vue3-frontend/vitest.config.js` 为过期副本（Vitest 实际加载 `vitest.config.ts`，已用 `DEBUG=vite:config` 验证；显式指定 `.js` 运行本用例会直接失败），建议删除以免误改。
6. **环境提示**：运行时 `Browserslist: caniuse-lite is 23 months old` 为无害提示，可执行 `npx update-browserslist-db@latest` 消除。


## 9. 复现方式

```bash
cd packages/bulin-vue3-frontend

# 仅本文件的 22 个用例
npx vitest run --browser.headless src/pages/table-expand-collapse/index.test.ts

# 包内全部用例（本文件 + vitest-example）
npx vitest run --browser.headless

# 输出机器可读结果（本报告数据来源）
npx vitest run --browser.headless --reporter=json --outputFile=../../vitest-result.json \
  src/pages/table-expand-collapse/index.test.ts

# 静态检查（结果：Found 0 warnings and 0 errors）
npx oxlint src/pages/table-expand-collapse/index.vue src/pages/table-expand-collapse/index.test.ts
```

## 10. 结论

- **修复前**：`handleExpand` / `handleCollapse` 存在 4 个可复现缺陷 + 1 个副作用，其中缺陷 1（收起一棵树误删另一棵树的展开状态，并进一步导致子行重复插入、`row-key` 重复）为**纯 UI 操作即可触发的严重状态污染**。
- **修复后**：22 个用例（常规流程 6、缺陷回归 6、边界与健壮性 7、关联函数 3）全部通过，两个函数的全部判定分支均被覆盖，DOM 渲染结果与 `expandedRowKeys` / `tableData` 状态在所有场景下保持一致。
- **判定**：`handleExpand` / `handleCollapse` 当前实现**可靠**，可提交；第 8 节列出的 6 项为改进建议，不阻塞本次交付。

## 11. 交付物清单

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| `src/pages/table-expand-collapse/index.vue` | 修改 | 修复两个函数 + 模板图标判定 + `getExpandedRows` 的 key 策略 |
| `src/pages/table-expand-collapse/index.test.ts` | 新增 | 22 个用例（浏览器模式真实挂载） |
| `src/pages/table-expand-collapse/TEST_REPORT.md` | 新增 | 本报告 |
| `vitest.config.ts` | 修改 | 补齐 `@` 系列别名、`vueJsx()`、`resolve.extensions` |
| `.gitignore` | 修改 | 忽略 `__screenshots__`（浏览器模式失败截图产物） |
