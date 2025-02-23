// 手写防抖函数
function myDebounced(fun, wait = 300) {
  if (typeof fun !== 'function') {
    throw new TypeError('第1个入参请传入函数！');
  }
  if (isNaN(wait)) {
    throw new TypeError('第2个入参请传入数值！');
  }
  let timer;
  return (...args) => {
    timer && clearTimeout(timer);
    timer = setTimeout(fun, wait, ...args);
  };
}

function getRangeInteger(min, max) {
  if (min > max) {
    [min, max] = [max, min]; // 交换
  }
  min = Math.floor(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getFullLetters() {
  const letters = [];
  if (!letters.length) {
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      letters.push(letter);
    }
  }
  return letters;
}

export { getRangeInteger, myDebounced };
