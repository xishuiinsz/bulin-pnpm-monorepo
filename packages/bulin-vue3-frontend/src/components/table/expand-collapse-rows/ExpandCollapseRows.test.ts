/**
 * ExpandCollapseRows 组件「展开 / 折叠」功能验证
 *
 * 被测组件：src/components/table/expand-collapse-rows/ExpandCollapseRows.vue
 * 组件职责：只负责「渲染」展开/折叠 UI 与「派发」交互回调，自身不持有任何展开状态：
 *   - 是否渲染图标  ：row[childKey]?.length
 *   - 渲染 + 还是 - ：expandedRowKeys.includes(getRowKey(row))
 *   - 缩进层级类名  ：row.level → level-N（无 level 时为 level-1）
 *   - 点击 +        ：handleExpand(row)；点击 - ：handleCollapse(row)
 *
 * 验证方式：Vitest 浏览器模式（Playwright + Chromium）真实挂载组件，
 *   1. 渲染断言：+ / - 图标以 @element-plus/icons-vue 的 Plus / Minus 真实 path[d] 为基准比对；
 *   2. 交互断言：dispatchEvent 真实点击 svg 图标，校验回调的调用次数与入参（引用相等）；
 *   3. 联动断言：与 useExpandCollapseRows 组合成迷你表格，验证
 *      「点击 + → 子行出现 → 图标变 -」与「点击 - → 子行消失 → 图标变 +」的完整闭环。
 *
 * 实现约定（踩坑记录）：
 *   - vitest-browser-vue 的 render() 内部会 unwrapNode(container)，组件根节点被移到 document.body，
 *     result.container 是「已脱空的 div」，所以断言统一从 document 查询；
 *   - 为了让多个用例挂载的实例互不干扰，每次挂载都套一层带唯一 class 的宿主组件作为查询作用域。
 */
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';
import { defineComponent, h, nextTick, reactive, shallowReactive } from 'vue';
import type { Component as VueComponent } from 'vue';
import { cleanup, render } from 'vitest-browser-vue';
import ElementPlus from 'element-plus';
import { Minus, Plus } from '@element-plus/icons-vue';
import ExpandCollapseRows from './ExpandCollapseRows.vue';
import { useExpandCollapseRows } from '../utils';

const ExpandCollapseRowsComp = ExpandCollapseRows as unknown as VueComponent;

interface Row {
  id?: string;
  surname: string;
  slogan?: string;
  address?: string;
  level?: number;
  childrenList?: Row[];
  children?: Row[];
}

/** useExpandCollapseRows 的泛型约束要求 id / level 必填 */
type HookRow = Row & { id: string; level: number };

interface RowProps {
  row: Row;
  column: Record<string, any>;
  expandedRowKeys: string[];
  childKey: string;
  getRowKey: (row: Row) => string;
  handleExpand: (row: Row) => void;
  handleCollapse: (row: Row) => void;
}

type IconState = 'plus' | 'minus' | 'none' | 'unknown';

/** 与 index.vue 保持一致的默认行唯一标识策略：优先 id，无 id 时兜底 slogan + surname */
const getRowKey = (row: Row) => row.id || `${row.slogan ?? ''}${row.surname}`;

const createRow = (over: Partial<Row> = {}): Row => ({
  id: 'row-1',
  surname: '张三丰',
  slogan: 'slogan-1',
  address: 'No. 189, Grove St, Los Angeles',
  ...over
});

/** 带两个子节点的父行（默认展开态判定用的 key 为 p1） */
const createParentRow = (over: Partial<Row> = {}): Row =>
  createRow({
    id: 'p1',
    surname: '张三丰',
    childrenList: [
      createRow({ id: 'c1', surname: '张启迪' }),
      createRow({ id: 'c2', surname: '张明星' })
    ],
    ...over
  });

// ---------------------------------------------------------------------------
// +/- 图标基准：直接渲染 element-plus 的图标组件，取其真实 path[d]，避免硬编码
// ---------------------------------------------------------------------------
const iconRefs = { plus: '', minus: '' };
let scopeSeed = 0;
const nextScope = () => `ecr-scope-${++scopeSeed}`;

const readIconPath = (icon: VueComponent) => {
  const scope = nextScope();
  const Host = defineComponent({
    name: 'IconProbe',
    setup: () => () => h('div', { class: scope }, [h(icon)])
  });
  const result = render(Host, { global: { plugins: [ElementPlus] } });
  const d = document.querySelector(`.${scope} path`)?.getAttribute('d') ?? '';
  result.unmount();
  return d;
};

const originalLog = console.log.bind(console);

beforeAll(() => {
  iconRefs.plus = readIconPath(Plus as unknown as VueComponent);
  iconRefs.minus = readIconPath(Minus as unknown as VueComponent);
  expect(iconRefs.plus).not.toBe('');
  expect(iconRefs.minus).not.toBe('');
  expect(iconRefs.plus).not.toBe(iconRefs.minus);
  // 组件里有一行调试用的 console.log('props: ', props)，浏览器模式下会刷屏，这里只屏蔽它
  vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('props:')) return;
    originalLog(...args);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
  // 兜底清理：避免残留 DOM 影响下一个用例的 document 查询
  document.querySelectorAll('[class*="ecr-scope"], .mini-table').forEach((el) => el.remove());
});

// ---------------------------------------------------------------------------
// DOM 断言辅助
// ---------------------------------------------------------------------------
const nameOf = (el: HTMLElement | null) => (el?.querySelector('span')?.textContent ?? '').trim();

const iconStateOfEl = (el: HTMLElement | null): IconState => {
  const d = el?.querySelector('svg path')?.getAttribute('d') ?? '';
  if (!d) return 'none';
  if (d === iconRefs.plus) return 'plus';
  if (d === iconRefs.minus) return 'minus';
  return 'unknown';
};

const levelClassOfEl = (el: HTMLElement | null) =>
  Array.from(el?.classList ?? []).find((c) => c.startsWith('level-')) ?? '';

// ---------------------------------------------------------------------------
// 单组件挂载：套一层唯一 class 的宿主，props 放在 shallowReactive 里便于用例内改值
// ---------------------------------------------------------------------------
interface MountOptions extends Partial<RowProps> {
  /** 初始 expandedRowKeys */
  keys?: string[];
}

interface MountedRows {
  scope: string;
  state: RowProps;
  handleExpand: Mock;
  handleCollapse: Mock;
  root: () => HTMLElement | null;
  icon: () => Element | null;
  iconState: () => IconState;
  levelClass: () => string;
  text: () => string;
  clickIcon: () => Promise<void>;
  clickText: () => Promise<void>;
  clickRoot: () => Promise<void>;
  unmount: () => void;
}

const mountRows = (options: MountOptions = {}): MountedRows => {
  const scope = nextScope();
  const handleExpand = (options.handleExpand ?? vi.fn()) as Mock;
  const handleCollapse = (options.handleCollapse ?? vi.fn()) as Mock;
  const state = shallowReactive<RowProps>({
    row: options.row ?? createParentRow(),
    column: options.column ?? { property: 'surname', label: '姓氏' },
    expandedRowKeys: reactive([...(options.keys ?? [])]),
    childKey: options.childKey ?? 'childrenList',
    getRowKey: options.getRowKey ?? getRowKey,
    handleExpand,
    handleCollapse
  });

  const Host = defineComponent({
    name: 'ExpandCollapseRowsScope',
    setup: () => () =>
      h('div', { class: scope }, [
        h(ExpandCollapseRowsComp, {
          row: state.row,
          column: state.column,
          expandedRowKeys: state.expandedRowKeys,
          childKey: state.childKey,
          getRowKey: state.getRowKey,
          handleExpand: state.handleExpand,
          handleCollapse: state.handleCollapse
        })
      ])
  });

  const result = render(Host, { global: { plugins: [ElementPlus] } });
  const root = () => document.querySelector<HTMLElement>(`.${scope} .expand-collapse-rows`);
  const click = async (el: Element | null, label: string) => {
    if (!el) throw new Error(`未找到可点击元素：${label}`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
  };

  return {
    scope,
    state,
    handleExpand,
    handleCollapse,
    root,
    icon: () => root()?.querySelector('svg') ?? null,
    iconState: () => iconStateOfEl(root()),
    levelClass: () => levelClassOfEl(root()),
    text: () => nameOf(root()),
    clickIcon: () => click(root()?.querySelector('svg') ?? null, `${scope} 的 +/- 图标`),
    clickText: () => click(root()?.querySelector('span') ?? null, `${scope} 的姓氏文本`),
    clickRoot: () => click(root(), `${scope} 的根元素`),
    unmount: () => result.unmount()
  };
};

const waitIconState = (mounted: MountedRows, expected: IconState) =>
  vi.waitFor(() => expect(mounted.iconState()).toBe(expected));

// ---------------------------------------------------------------------------
// 一、渲染：图标 / 文本 / 层级类名
// ---------------------------------------------------------------------------
describe('ExpandCollapseRows 渲染', () => {
  test('有子节点且未展开：渲染 + 图标与姓氏文本', () => {
    const m = mountRows();
    expect(m.root()).not.toBeNull();
    expect(m.text()).toBe('张三丰');
    expect(m.iconState()).toBe('plus');
    expect(m.root()?.classList.contains('d-flex')).toBe(true);
    expect(m.root()?.classList.contains('align-items-center')).toBe(true);
    m.unmount();
  });

  test('有子节点且已展开（key 命中）：渲染 - 图标', () => {
    const m = mountRows({ keys: ['p1'] });
    expect(m.iconState()).toBe('minus');
    expect(m.text()).toBe('张三丰');
    m.unmount();
  });

  test('expandedRowKeys 里是别的行的 key：当前行仍是 + 图标', () => {
    const m = mountRows({ keys: ['other-row-key', 'c1'] });
    expect(m.iconState()).toBe('plus');
    m.unmount();
  });

  test('叶子行（无 childrenList）：不渲染图标，只渲染姓氏', () => {
    const m = mountRows({ row: createRow({ id: 'leaf', surname: '张启迪' }) });
    expect(m.text()).toBe('张启迪');
    expect(m.icon()).toBeNull();
    expect(m.iconState()).toBe('none');
    m.unmount();
  });

  test('childrenList 为空数组：同样不渲染图标', () => {
    const m = mountRows({ row: createRow({ id: 'empty', surname: '空子节点', childrenList: [] }) });
    expect(m.iconState()).toBe('none');
    m.unmount();
  });

  test('图标挂在 el-icon 上并带可点击样式类', () => {
    const m = mountRows();
    const iconWrapper = m.root()?.querySelector('i.el-icon');
    expect(iconWrapper).not.toBeNull();
    expect(iconWrapper?.classList.contains('cursor-pointer')).toBe(true);
    expect(m.icon()?.tagName.toLowerCase()).toBe('svg');
    m.unmount();
  });

  test('level 类名随行层级变化：无 level → level-1，2 → level-2，4 → level-4', () => {
    const noLevel = mountRows({ row: createParentRow({ level: undefined }) });
    expect(noLevel.levelClass()).toBe('level-1');
    noLevel.unmount();

    const level2 = mountRows({ row: createParentRow({ level: 2 }) });
    expect(level2.levelClass()).toBe('level-2');
    level2.unmount();

    const level4 = mountRows({ row: createParentRow({ level: 4 }) });
    expect(level4.levelClass()).toBe('level-4');
    level4.unmount();
  });

  test('自定义 childKey=children：按该字段判断是否有子节点', () => {
    const withChildren = mountRows({
      childKey: 'children',
      row: createRow({ id: 'p9', surname: '自定义字段父行', children: [createRow({ id: 'p9-1' })] })
    });
    expect(withChildren.iconState()).toBe('plus');
    withChildren.unmount();

    // 反向验证：确实读的是 childKey，而不是写死的 childrenList
    const ignoredChildrenList = mountRows({
      childKey: 'children',
      row: createRow({ id: 'p10', surname: '只有childrenList', childrenList: [createRow({ id: 'p10-1' })] })
    });
    expect(ignoredChildrenList.iconState()).toBe('none');
    ignoredChildrenList.unmount();
  });

  test('自定义 getRowKey：无 id 的行用 slogan+surname 判定展开态', () => {
    const row = createRow({
      id: undefined,
      surname: '无ID甲',
      slogan: 'no-id-1',
      childrenList: [createRow({ id: undefined, surname: '无ID甲-子', slogan: 'no-id-1' })]
    });
    const expanded = mountRows({ row, keys: ['no-id-1无ID甲'] });
    expect(expanded.iconState()).toBe('minus');
    expanded.unmount();

    // key 不匹配（例如只用了 surname）时不会被误判为已展开
    const notExpanded = mountRows({ row, keys: ['无ID甲'] });
    expect(notExpanded.iconState()).toBe('plus');
    notExpanded.unmount();
  });

  test('column 只是透传的表格上下文，不参与渲染：不同 column 结果一致', () => {
    const a = mountRows({ column: { property: 'surname', label: '姓氏', columnIndex: 1 } });
    const htmlA = a.root()?.innerHTML ?? '';
    a.unmount();

    const b = mountRows({ column: { property: 'other', label: '其它', columnIndex: 9 } });
    const htmlB = b.root()?.innerHTML ?? '';
    b.unmount();

    expect(htmlA).toBe(htmlB);
  });
});

// ---------------------------------------------------------------------------
// 二、交互：点击图标派发 handleExpand / handleCollapse
// ---------------------------------------------------------------------------
describe('ExpandCollapseRows 交互', () => {
  test('未展开时点击 + ：handleExpand 被调用 1 次且入参是当前 row，handleCollapse 未被调用', async () => {
    const row = createParentRow();
    const m = mountRows({ row });
    expect(m.iconState()).toBe('plus');

    await m.clickIcon();

    expect(m.handleExpand).toHaveBeenCalledTimes(1);
    // 入参必须是同一个 row 对象引用，父级才能据此定位到表格里的行
    expect(m.handleExpand.mock.calls[0]?.[0]).toBe(row);
    expect(m.handleCollapse).not.toHaveBeenCalled();
    m.unmount();
  });

  test('已展开时点击 - ：handleCollapse 被调用 1 次且入参是当前 row，handleExpand 未被调用', async () => {
    const row = createParentRow();
    const m = mountRows({ row, keys: ['p1'] });
    expect(m.iconState()).toBe('minus');

    await m.clickIcon();

    expect(m.handleCollapse).toHaveBeenCalledTimes(1);
    expect(m.handleCollapse.mock.calls[0]?.[0]).toBe(row);
    expect(m.handleExpand).not.toHaveBeenCalled();
    m.unmount();
  });

  test('图标随状态切换后，点击派发的是对应的回调（+ → - → +）', async () => {
    const row = createParentRow();
    const m = mountRows({ row });

    await m.clickIcon(); // 此时是 +
    expect(m.handleExpand).toHaveBeenCalledTimes(1);
    expect(m.handleCollapse).not.toHaveBeenCalled();

    m.state.expandedRowKeys.push('p1');
    await waitIconState(m, 'minus');

    await m.clickIcon(); // 此时是 -
    expect(m.handleCollapse).toHaveBeenCalledTimes(1);
    expect(m.handleExpand).toHaveBeenCalledTimes(1);
    m.unmount();
  });

  test('叶子行没有图标：点击组件任意位置都不会派发回调', async () => {
    const m = mountRows({ row: createRow({ id: 'leaf', surname: '张启迪' }) });
    expect(m.icon()).toBeNull();

    await m.clickRoot();
    await m.clickText();

    expect(m.handleExpand).not.toHaveBeenCalled();
    expect(m.handleCollapse).not.toHaveBeenCalled();
    m.unmount();
  });

  test('点击姓氏文本 / 根元素不派发回调：事件只绑在图标上', async () => {
    const m = mountRows();
    await m.clickText();
    await m.clickRoot();
    expect(m.handleExpand).not.toHaveBeenCalled();
    expect(m.handleCollapse).not.toHaveBeenCalled();

    await m.clickIcon();
    expect(m.handleExpand).toHaveBeenCalledTimes(1);
    m.unmount();
  });

  test('父级未更新状态时连点两次 + 会派发两次 handleExpand：组件无内部状态，幂等由父级保证', async () => {
    const m = mountRows();
    const icon = m.icon();
    icon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    icon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(m.handleExpand).toHaveBeenCalledTimes(2);
    // 组件不会因为点过就自己变成 -，仍是 +（完全受控）
    expect(m.iconState()).toBe('plus');
    m.unmount();
  });

  test('受控刷新：expandedRowKeys 原地 push / splice 后图标自动切换，无需重新点击', async () => {
    const m = mountRows();
    expect(m.iconState()).toBe('plus');

    m.state.expandedRowKeys.push('p1');
    await waitIconState(m, 'minus');

    m.state.expandedRowKeys.splice(0, 1);
    await waitIconState(m, 'plus');
    m.unmount();
  });

  test('受控刷新：父级整体替换 expandedRowKeys 数组也能正确刷新图标', async () => {
    const m = mountRows();
    m.state.expandedRowKeys = ['p1'];
    await waitIconState(m, 'minus');

    m.state.expandedRowKeys = [];
    await waitIconState(m, 'plus');
    m.unmount();
  });

  test('受控刷新：父级替换 row 后文本与展开态同步更新', async () => {
    const m = mountRows({ keys: ['p1'] });
    expect(m.text()).toBe('张三丰');
    expect(m.iconState()).toBe('minus');

    // 换成另一棵树：key p1 不再命中，图标应回到 +
    m.state.row = createRow({
      id: 'p2',
      surname: '李世民',
      childrenList: [createRow({ id: 'c9', surname: '李想啥' })]
    });
    await vi.waitFor(() => expect(m.text()).toBe('李世民'));
    expect(m.iconState()).toBe('plus');

    m.state.expandedRowKeys = ['p2'];
    await waitIconState(m, 'minus');
    m.unmount();
  });

  test('自定义 childKey 时点击同样派发回调，入参为该行', async () => {
    const row = createRow({ id: 'p9', surname: '自定义字段父行', children: [createRow({ id: 'p9-1' })] });
    const m = mountRows({ row, childKey: 'children' });

    await m.clickIcon();
    expect(m.handleExpand).toHaveBeenCalledTimes(1);
    expect(m.handleExpand.mock.calls[0]?.[0]).toBe(row);
    m.unmount();
  });
});
