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
  filter: Record<K, unknown>
) => {
  const result = list.find((item) => {
    const [key] = Object.keys(filter);
    const [value] = Object.values(filter);
    return item[key] === value;
  });
  return result;
};

/**
 * @description list排序
 *
 * @example
 * const result = sortListByFeild(
 * [
 *   { a: '-', b: 2, c: 3, d: 4 },
 *   { a: 1, b: 2, c: 3, d: 4 },
 *   { a: 10, b: 12, c: 3, d: 24 },
 *   { a: 0, b: 22, c: -3, d: 49 },
 *   { a: '-', b: -2, c: -93, d: 9 }
 * ],
 * { field: 'a', sort: 'asc' }
 * );
 */
export const sortListByFeild = <T extends Record<string, number | string>>(
  list: T[],
  { field, sort }: { field: keyof T; sort: 'asc' | 'desc' }
) => {
  return list.sort((item1, item2) => {
    const getValue = (num: number) => {
      if (isNaN(num)) {
        if (sort === 'asc') {
          return Number.MAX_SAFE_INTEGER;
        }
        return -Number.MAX_SAFE_INTEGER;
      }
      return num;
    };
    const value1 = getValue(item1[field] as number);
    const value2 = getValue(item2[field] as number);
    if (sort === 'asc') {
      return value1 - value2;
    }
    return value2 - value1;
  });
};
