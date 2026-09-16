/**
 * handleExpand / handleCollapse 可靠性验证
 *
 * 验证方式：Vitest 浏览器模式（Playwright + Chromium）真实挂载 index.vue，
 * 通过点击表格里的 +/- 图标（用户视角）或直接调用组件 setupState 上的
 * handleExpand / handleCollapse（函数视角），断言「表格实际渲染出来的行」
 * 与「expandedRowKeys 状态」是否始终一致。
 *
 * 用例分组（均为修复后的回归断言）：
 * - 常规流程                      ：单层 / 多层展开收起的正确性
 * - handleCollapse 回归（原缺陷1） ：splice(-1, 1) 误删其它树的 key
 * - handleExpand 回归（原缺陷2）   ：非幂等导致重复插入子行
 * - 边界与健壮性（原缺陷3 / 4）     ：row 未命中 tableData、无 id 的行、行对象身份
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import { cleanup, render } from 'vitest-browser-vue';
import ElementPlus from 'element-plus';
import TableExpandCollapsePage from './index.vue';
import { tableList } from './page';

// 编辑弹窗依赖命令式 dialog，这里只验证展开/收起，mock 掉避免副作用
vi.mock('@/imperatives/showDialog', () => ({
  default: () => ({ destroy: () => {} })
}));

interface Row {
  id?: string;
  surname: string;
  slogan: string;
  address: string;
  level?: number;
  childrenList?: Row[];
}

interface PageState {
  tableData: Row[];
  expandedRowKeys: string[];
  handleExpand: (row: Row) => void;
  handleCollapse: (row: Row) => void;
}

const sourceList = tableList as unknown as Row[];

/** 按 surname 从源数据里取 id（id 由 generateUniqueId 在模块加载时生成，稳定不变） */
const findId = (surname: string, list: Row[] = sourceList): string => {
  for (const item of list) {
    if (item.surname === surname) return item.id as string;
    if (item.childrenList?.length) {
      const found = findId(surname, item.childrenList);
      if (found) return found;
    }
  }
  return '';
};

let renderResult: { unmount: () => void } | null = null;

/** 取页面组件 <script setup> 暴露出来的状态与方法 */
const getInstanceState = (): PageState => {
  const el = document.querySelector('.table-expand-collapse') as
    | (HTMLElement & { __vueParentComponent?: { setupState?: PageState } })
    | null;
  const setupState = el?.__vueParentComponent?.setupState;
  if (!setupState) throw new Error('未能获取到页面组件的 setupState');
  return setupState;
};

const getRowEls = () =>
  Array.from(document.querySelectorAll<HTMLTableRowElement>('tr.el-table__row'));

/**
 * 第一列（slogan）会被 span-method 合并，被合并掉的行少一个 td，
 * 所以统一用「带 .d-flex.align-items-center 的那个 td」定位姓名列。
 */
const getSurnameCell = (tr: HTMLTableRowElement | null) =>
  tr?.querySelector('td div.d-flex.align-items-center')?.closest('td') ?? null;

const getRowName = (tr: HTMLTableRowElement) => (getSurnameCell(tr)?.textContent ?? '').trim();

const getRowNames = () => getRowEls().map(getRowName);

const getRowEl = (name: string) => getRowEls().find((tr) => getRowName(tr) === name) ?? null;

const getIconEl = (name: string) => getSurnameCell(getRowEl(name))?.querySelector('svg') ?? null;

/** 初始状态下所有图标都是 Plus，用它作为基准判断当前是 + 还是 - */
let plusIconPath = '';

const iconStateOf = (name: string): 'plus' | 'minus' | 'none' => {
  const d = getIconEl(name)?.querySelector('path')?.getAttribute('d') ?? '';
  if (!d) return 'none';
  return d === plusIconPath ? 'plus' : 'minus';
};

const levelClassOf = (name: string) => {
  const div = getSurnameCell(getRowEl(name))?.querySelector('div.d-flex');
  return Array.from(div?.classList ?? []).find((c) => c.startsWith('level-')) ?? '';
};

/** 点击某一行的 +/- 图标（真实 DOM 事件，走模板里绑定的 handleExpand / handleCollapse） */
const clickIcon = async (name: string) => {
  const icon = getIconEl(name);
  if (!icon) throw new Error(`未找到「${name}」行的展开/收起图标`);
  icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await nextTick();
};

const waitRows = (expected: string[]) =>
  vi.waitFor(() => expect(getRowNames()).toEqual(expected));

beforeEach(async () => {
  renderResult = render(TableExpandCollapsePage, {
    global: { plugins: [ElementPlus] }
  }) as unknown as { unmount: () => void };
  await waitRows(['张三丰', '李世民']);
  plusIconPath = getIconEl('张三丰')?.querySelector('path')?.getAttribute('d') ?? '';
});

afterEach(() => {
  renderResult?.unmount?.();
  cleanup();
  document.querySelectorAll('.table-expand-collapse').forEach((el) => {
    const host = el.parentElement;
    el.remove();
    if (host && host !== document.body && !host.childElementCount) host.remove();
  });
});

describe('handleExpand / handleCollapse 常规流程', () => {
  test('展开根节点：子行按序插入父行之后，key 被记录，图标变为 -', async () => {
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    const state = getInstanceState();
    expect(state.expandedRowKeys).toEqual([findId('张三丰')]);
    expect(iconStateOf('张三丰')).toBe('minus');
    expect(levelClassOf('张启迪')).toBe('level-2');
    expect(levelClassOf('张明理')).toBe('level-2');
  });

  test('收起根节点：子孙行全部移除，key 被清空，图标恢复为 +', async () => {
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    await clickIcon('张三丰');
    await waitRows(['张三丰', '李世民']);

    const state = getInstanceState();
    expect(state.expandedRowKeys).toEqual([]);
    expect(iconStateOf('张三丰')).toBe('plus');
  });

  test('展开二级节点：插入位置正确且 level 递增为 3', async () => {
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    await clickIcon('张明星');
    await waitRows(['张三丰', '张启迪', '张明星', '张明天', '张明白', '张明理', '李世民']);

    const state = getInstanceState();
    expect(state.expandedRowKeys).toEqual([findId('张三丰'), findId('张明星')]);
    expect(iconStateOf('张明星')).toBe('minus');
    expect(levelClassOf('张明星')).toBe('level-2');
    expect(levelClassOf('张明天')).toBe('level-3');
    expect(levelClassOf('张明白')).toBe('level-3');
  });

  test('收起二级节点：只移除自己的子孙，父级展开状态不受影响', async () => {
    await clickIcon('张三丰');
    await clickIcon('张明星');
    await waitRows(['张三丰', '张启迪', '张明星', '张明天', '张明白', '张明理', '李世民']);

    await clickIcon('张明星');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    const state = getInstanceState();
    expect(state.expandedRowKeys).toEqual([findId('张三丰')]);
    expect(iconStateOf('张明星')).toBe('plus');
  });

  test('收起父节点：连带清理已展开子孙的 key 与行', async () => {
    await clickIcon('张三丰');
    await clickIcon('张明星');
    await waitRows(['张三丰', '张启迪', '张明星', '张明天', '张明白', '张明理', '李世民']);

    await clickIcon('张三丰');
    await waitRows(['张三丰', '李世民']);

    expect(getInstanceState().expandedRowKeys).toEqual([]);
  });

  test('反复展开/收起多轮：行与 key 始终一致（无残留、无重复）', async () => {
    for (let i = 0; i < 3; i++) {
      await clickIcon('张三丰');
      await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
      await clickIcon('张明星');
      await waitRows(['张三丰', '张启迪', '张明星', '张明天', '张明白', '张明理', '李世民']);
      await clickIcon('张三丰');
      await waitRows(['张三丰', '李世民']);
      expect(getInstanceState().expandedRowKeys).toEqual([]);
    }
  });
});

describe('handleCollapse 回归（原缺陷1：splice(-1,1) 误删其它树的 key）', () => {
  const prepareTwoExpandedTrees = async () => {
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
    await clickIcon('李世民');
    await waitRows([
      '张三丰',
      '张启迪',
      '张明星',
      '张明理',
      '李世民',
      '李想啥',
      '李泽楷',
      '李是谁'
    ]);
  };

  test('收起一棵树不影响另一棵树的展开状态（key 与图标都保持）', async () => {
    await prepareTwoExpandedTrees();
    await clickIcon('张三丰'); // 收起张三丰
    await waitRows(['张三丰', '李世民', '李想啥', '李泽楷', '李是谁']);

    const state = getInstanceState();
    expect(state.expandedRowKeys).toEqual([findId('李世民')]);
    // 视图与状态一致：子行在，图标就是 -
    expect(iconStateOf('李世民')).toBe('minus');
    expect(iconStateOf('张三丰')).toBe('plus');
  });

  test('收起第二棵树同样不影响第一棵树', async () => {
    await prepareTwoExpandedTrees();
    await clickIcon('李世民');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    expect(getInstanceState().expandedRowKeys).toEqual([findId('张三丰')]);
    expect(iconStateOf('张三丰')).toBe('minus');
  });

  test('原「连锁重复插入」场景：图标仍是 -，再点一次即正常收起', async () => {
    await prepareTwoExpandedTrees();
    await clickIcon('张三丰');
    await waitRows(['张三丰', '李世民', '李想啥', '李泽楷', '李是谁']);

    await clickIcon('李世民');
    await waitRows(['张三丰', '李世民']);
    expect(getInstanceState().expandedRowKeys).toEqual([]);
    expect(getRowNames().filter((n) => n === '李想啥').length).toBe(0);
  });
});


describe('handleExpand 回归（原缺陷2：非幂等导致重复插入）', () => {
  test('同一帧内连续两次点击 +（Vue 尚未重渲染）不会重复插入子行', async () => {
    const icon = getIconEl('张三丰') as Element;
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
    expect(getInstanceState().expandedRowKeys).toEqual([findId('张三丰')]);
  });

  test('直接连续调用多次 handleExpand(row) 也是幂等的', async () => {
    const state = getInstanceState();
    const row = state.tableData.find((item) => item.surname === '张三丰') as Row;
    state.handleExpand(row);
    state.handleExpand(row);
    state.handleExpand(row);
    await nextTick();
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
    expect(state.expandedRowKeys).toEqual([findId('张三丰')]);
  });

  test('连续调用多次 handleCollapse(row) 同样幂等，不会误删其它 key', async () => {
    await clickIcon('张三丰');
    await clickIcon('李世民');
    await waitRows([
      '张三丰',
      '张启迪',
      '张明星',
      '张明理',
      '李世民',
      '李想啥',
      '李泽楷',
      '李是谁'
    ]);

    const state = getInstanceState();
    const row = state.tableData.find((item) => item.surname === '张三丰') as Row;
    state.handleCollapse(row);
    state.handleCollapse(row);
    await nextTick();
    await waitRows(['张三丰', '李世民', '李想啥', '李泽楷', '李是谁']);
    expect(state.expandedRowKeys).toEqual([findId('李世民')]);
  });
});


describe('handleExpand / handleCollapse 边界与健壮性', () => {
  const createGhostRow = (): Row => ({
    id: 'ghost-parent',
    surname: '幽灵父行',
    slogan: 'ghost',
    address: 'addr',
    childrenList: [{ id: 'ghost-child', surname: '幽灵子行', slogan: 'ghost', address: 'addr' }]
  });

  test('row 不在 tableData 中时直接返回，不改动表格与 key（原缺陷3）', async () => {
    const state = getInstanceState();
    state.handleExpand(createGhostRow());
    await nextTick();
    await waitRows(['张三丰', '李世民']);
    expect(state.expandedRowKeys).toEqual([]);
  });

  test('对不存在于表格中的行调用 handleCollapse 也是安全的空操作', async () => {
    const state = getInstanceState();
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    state.handleCollapse(createGhostRow());
    await nextTick();
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
    expect(state.expandedRowKeys).toEqual([findId('张三丰')]);
  });

  test('对叶子行（无 childrenList）调用 handleExpand 是空操作', async () => {
    const state = getInstanceState();
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    const leaf = state.tableData.find((item) => item.surname === '张启迪') as Row;
    expect(leaf.childrenList).toBeUndefined();
    state.handleExpand(leaf);
    await nextTick();
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
    expect(state.expandedRowKeys).toEqual([findId('张三丰')]);
  });

  test('对叶子行（无 childrenList）调用 handleCollapse 是空操作，不会误删已展开的 key', async () => {
    const state = getInstanceState();
    await clickIcon('张三丰');
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);

    const leaf = state.tableData.find((item) => item.surname === '张启迪') as Row;
    state.handleCollapse(leaf);
    await nextTick();
    await waitRows(['张三丰', '张启迪', '张明星', '张明理', '李世民']);
    expect(state.expandedRowKeys).toEqual([findId('张三丰')]);
    expect(iconStateOf('张三丰')).toBe('minus');
  });

  const appendIdLessRows = async (state: PageState) => {
    state.tableData.push(
      {
        surname: '无ID甲',
        slogan: 'no-id-1',
        address: 'a',
        childrenList: [{ surname: '无ID甲-子', slogan: 'no-id-1', address: 'a' }]
      } as Row,
      {
        surname: '无ID乙',
        slogan: 'no-id-2',
        address: 'b',
        childrenList: [{ surname: '无ID乙-子', slogan: 'no-id-2', address: 'b' }]
      } as Row
    );
    await vi.waitFor(() =>
      expect(getRowNames()).toEqual(['张三丰', '李世民', '无ID甲', '无ID乙'])
    );
    expect(iconStateOf('无ID甲')).toBe('plus');
    expect(iconStateOf('无ID乙')).toBe('plus');
  };

  test('无 id 的行也能正确定位并独立展开（原缺陷4）', async () => {
    const state = getInstanceState();
    await appendIdLessRows(state);

    await clickIcon('无ID乙');
    await waitRows(['张三丰', '李世民', '无ID甲', '无ID乙', '无ID乙-子']);

    // getRowKey 兜底为 slogan + surname，不再往 expandedRowKeys 里塞 undefined
    expect(state.expandedRowKeys).toEqual(['no-id-2无ID乙']);
    expect(iconStateOf('无ID乙')).toBe('minus');
    expect(levelClassOf('无ID乙-子')).toBe('level-2');
    // 另一个无 id 行不受影响
    expect(iconStateOf('无ID甲')).toBe('plus');
  });

  test('无 id 的行也能正确收起，且不影响其它无 id 行', async () => {
    const state = getInstanceState();
    await appendIdLessRows(state);

    await clickIcon('无ID乙');
    await waitRows(['张三丰', '李世民', '无ID甲', '无ID乙', '无ID乙-子']);

    await clickIcon('无ID乙');
    await waitRows(['张三丰', '李世民', '无ID甲', '无ID乙']);
    expect(state.expandedRowKeys).toEqual([]);
    expect(iconStateOf('无ID乙')).toBe('plus');
  });

  test('展开时就地写入 level，行对象身份保持稳定（原副作用）', async () => {
    const state = getInstanceState();
    const row = state.tableData.find((item) => item.surname === '张三丰') as Row;
    const before = row.childrenList?.[0];
    state.handleExpand(row);
    await nextTick();
    const after = row.childrenList?.[0];
    expect(after).toBe(before);
    expect(after?.level).toBe(2);
    expect(state.tableData[1]?.level).toBe(2);
  });
});


describe('getExpandedRows（handleEdit 重建表格所依赖）', () => {
  type StateWithExpanded = PageState & {
    getExpandedRows: (tree: Row[], keys: string[]) => Row[];
  };

  test('按 key 还原已展开的行，并写入正确的 level', () => {
    const state = getInstanceState() as StateWithExpanded;
    const rows = state.getExpandedRows(structuredClone(sourceList), [
      findId('张三丰'),
      findId('张明星')
    ]);
    expect(rows.map((row) => row.surname)).toEqual([
      '张三丰',
      '张启迪',
      '张明星',
      '张明天',
      '张明白',
      '张明理',
      '李世民'
    ]);
    expect(rows.map((row) => row.level)).toEqual([1, 2, 2, 3, 3, 2, 1]);
  });

  test('未展开的父节点不会带出子孙行', () => {
    const state = getInstanceState() as StateWithExpanded;
    const rows = state.getExpandedRows(structuredClone(sourceList), [findId('李世民')]);
    expect(rows.map((row) => row.surname)).toEqual([
      '张三丰',
      '李世民',
      '李想啥',
      '李泽楷',
      '李是谁'
    ]);
  });

  test('无 id 的行也能按 getRowKey 还原展开状态', () => {
    const state = getInstanceState() as StateWithExpanded;
    const tree: Row[] = [
      {
        surname: '无ID甲',
        slogan: 'no-id-1',
        address: 'a',
        childrenList: [{ surname: '无ID甲-子', slogan: 'no-id-1', address: 'a' }]
      }
    ];
    const rows = state.getExpandedRows(tree, ['no-id-1无ID甲']);
    expect(rows.map((row) => row.surname)).toEqual(['无ID甲', '无ID甲-子']);
    expect(rows.map((row) => row.level)).toEqual([1, 2]);
  });
});

