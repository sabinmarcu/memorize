export const wait = (
  timeout?: number | undefined,
  ...args: any[]
) => new Promise(
  (accept) => setTimeout(accept, timeout, ...args),
);

export const autoInstance = <
  A extends any[],
  T extends (...args: A) => R,
  R extends (...args: any[]) => any = ReturnType<T>,
>(
  func: T,
  ...args: A
) => (...instArgs: Parameters<R>): ReturnType<R> => {
  const instance = func(...args);
  return instance(...instArgs);
};
