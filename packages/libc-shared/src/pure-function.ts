export const getSpanOptions = (list: string[]): Record<number, number> => {
  if (!Array.isArray(list) || list.length < 2) return {};

  const res: Record<number, number> = {};
  let base = 0;

  list.reduce((pre, cur, idx) => {
    if (pre === cur) return cur; // 仍在同一段，继续

    const len = idx - base; // 上一段结束，计算长度
    res[base] = len;
    base = idx; // 开启新段
    return cur;
  });

  // 处理最后一段
  const lastLen = list.length - base;
  res[base] = lastLen;

  return res;
};

// 从列表中根据过滤条件获取单个对象
export const getItemByList = <T extends Record<string, unknown>, K extends keyof T>(
  list: T[],
  filter: Record<K, T[K]>
) => {
  const result = list.find((item) => {
    const [key] = Object.keys(filter);
    const [value] = Object.values(filter);
    return item[key] === value;
  });
  return result;
};
