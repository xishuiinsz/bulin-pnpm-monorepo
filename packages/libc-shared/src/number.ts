// 数字相关工具函数

// 区间内随机整数
export const getRandomInt = (min: number, max: number) => {
  min = Math.min(min, max);
  max = Math.max(min, max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const isValidNumberic = (value: unknown) => {
  if (['number', 'string'].includes(typeof value)) {
    return  Number.isFinite(parseFloat(String(value).trim())); 
  }
  return false;
};

export const numberFormat = (value: number, config: Record<string, unknown> = {}): number | string => {
  if (typeof value === 'number') {
    const options = { maximumFractionDigits: 2, minimumFractionDigits: 0, useGrouping: true, ...config };
    return new Intl.NumberFormat('en-US', options).format(value);
  }
  return value;
};
