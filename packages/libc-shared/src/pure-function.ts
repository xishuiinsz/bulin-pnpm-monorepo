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

export const isNumbericValue = (value: unknown) => {
  if (['number', 'string'].includes(typeof value)) {
    if (typeof value === 'string') {
      return isNaN(parseFloat(value.trim()));
    }
    if (Number.isFinite(value as number)) {
      return false;
    }
    return !isNaN(value as number);
  }
  return false;
};

