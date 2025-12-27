// 数字相关工具函数

export const percentSign = '%';

// 区间内随机整数
export const getRandomInt = (min: number, max: number) => {
  min = Math.min(min, max);
  max = Math.max(min, max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 判断是否为有限数
export const isFiniteNumber = (value: unknown) => {
  return Number.isFinite(parseFloat(String(value)));
};

// 将百分比转换成“等价”的小数
export const percentToDecimal = (value: unknown) => {
  if (typeof value === 'string' && value.endsWith(percentSign)) {
    if (isFiniteNumber(value)) {
      const _value = parseFloat(value) / 100;
      return _value;
    }
    return value;
  }
  return value;
};

// 判断2个有限数是否相等
export const isEqualNumbers = (a: unknown, b: unknown): boolean => {
  if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
    return false;
  }
  return parseFloat(percentToDecimal(a) as string) === parseFloat(percentToDecimal(b) as string);
};

export const numberFormat = (
  value: unknown,
  config: Intl.NumberFormatOptions & { placeholder: string }
): number | string => {
  const { placeholder, ...restConfig } = config;
  if (isFiniteNumber(value)) {
    const options = { maximumFractionDigits: 2, minimumFractionDigits: 0, useGrouping: true, ...restConfig };
    return new Intl.NumberFormat('en-US', options).format(value as number);
  }
  return placeholder;
};
