import { reactive, ref, toValue } from "vue";

export const useExpandCollapseRows = <T extends { id: string; level: number }, K extends keyof T>({
  defaultExpandedKeys = [],
  childKey,
  getRowId,
  refFlag,
}: {
  refFlag?: boolean;
  getRowId: (row: T) => string;
  defaultExpandedKeys: string[];
  childKey: K;
}) => {
  const refActive = refFlag ? ref : reactive;
  const tableData = refActive<T[]>([]);

  const flatMapAll = <T>(list: T[], data: T[] = []) => {
    list.forEach((item: T) => {
      const { [childKey]: childrenList, ...rest } = item;
      data.push({ ...rest });
      if (childrenList?.length) {
        flatMapAll(childrenList, data);
      }
    });
    return data;
  };

  const getRowKey = (row: T) => {
    return typeof getRowId === "function" ? getRowId(row) : row.id;
  };

  const handleExpand = (row: T) => {
    if (!row?.[childKey]?.length) {
      return;
    }
    // 统一用 getRowKey 作为唯一标识（兼容没有 id 的行），避免直接用 row.id 匹配失败
    const rowKey = getRowKey(row);
    // 已展开则直接返回：保证函数幂等，重复点击 / 重复调用都不会重复插入子行
    if (expandedRowKeys.includes(rowKey)) {
      return;
    }
    const index = toValue(tableData).findIndex((item) => getRowKey(item as T) === rowKey);
    // 定位不到当前行（例如传入的是不在表格里的数据）时，不修改任何状态
    if (index < 0) {
      return;
    }
    const currentLevel = row.level || 1;
    // 就地写入 level，避免每次展开都重建 childrenList 对象（行对象身份保持稳定）
    row?.[childKey].forEach((item: T) => {
      item.level = currentLevel + 1;
    });
    expandedRowKeys.push(rowKey);

    tableData.splice(index + 1, 0, ...row?.[childKey]);
  };

  const handleCollapse = (row: T) => {
    if (!row?.[childKey]?.length) {
      return;
    }
    const rowKey = getRowKey(row);
    const selfKeyIndex = expandedRowKeys.indexOf(rowKey);
    if (selfKeyIndex > -1) {
      expandedRowKeys.splice(selfKeyIndex, 1);
    }
    // 递归收集整棵子树的 key（flatMapAll 会把所有子孙平铺出来）
    const descendantKeys = flatMapAll(row?.[childKey] || []).map((item) => getRowKey(item));

    for (let index = tableData.length - 1; index >= 0; index--) {
      const element = tableData[index] as T;
      const elementKey = getRowKey(element);
      if (!descendantKeys.includes(elementKey)) {
        continue;
      }
      tableData.splice(index, 1);
      // 先判断 indexOf > -1 再删除：否则 indexOf 返回 -1 时 splice(-1, 1)
      // 会误删 expandedRowKeys 的最后一个元素（其它已展开节点的 key）
      const keyIndex = expandedRowKeys.indexOf(elementKey);
      if (keyIndex > -1) {
        expandedRowKeys.splice(keyIndex, 1);
      }
    }
  };
  const handleExpandAll = () => {};
  const handleCollapseAll = () => {};
  const expandedRowKeys = reactive([...defaultExpandedKeys]);

  const result = {
    tableData,
    handleExpand,
    handleCollapse,
    expandedRowKeys,
    handleExpandAll,
    handleCollapseAll,
  };

  return result;
};
