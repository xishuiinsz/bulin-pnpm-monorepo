/**
 * 公共方法
 */

import { uniqueId } from 'lodash';

// 判断是否是字符串
export const isString = (value) => {
  return typeof value === 'string';
};

// 判断是否是数字
export const isNumber = (value) => {
  return typeof value === 'number';
};

// 判断是否是函数
export const isFunction = (value) => {
  return typeof value === 'function';
};

// 判断是否是数组
export const isArray = Array.isArray;

// 判断是否是对象
export const isObject = (value) => typeof value === 'object' && value !== null;

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
