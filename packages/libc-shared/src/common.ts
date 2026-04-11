

// 函数执行器，支持递归执行函数
export const functionExecutor = (params: unknown) => {
    if (params === null || typeof params !== 'object') {
        return;
    }
    if (typeof params === 'function') {
        params();
    } else if (Array.isArray(params)) {
        params.forEach(functionExecutor);
    } else {
        functionExecutor(Object.values(params));
    }
}