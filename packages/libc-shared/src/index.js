/**
 * 公共方法
 */

import { uniqueId } from 'lodash';
export * from './pure-function';

// 生成唯一 ID
export const generateUniqueId = (prefix = 'id') => {
  return uniqueId(prefix);
};

// 区间内随机整数
export const getRandomInt = (min, max) => {
  min = Math.min(min, max);
  max = Math.max(min, max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
