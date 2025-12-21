/**
 * 公共方法
 */

import { uniqueId } from 'lodash';
export * from './pure-function';
export * from './number';

// 生成唯一 ID
export const generateUniqueId = (prefix = 'id') => {
  return uniqueId(prefix);
};
