type MaybeSingle<T> = T | [T];
export type FunctionExecutorParam = MaybeSingle<Function> | Record<string, MaybeSingle<Function>> | null;
