import { CamelToKebab, CamelToSnake, Prefix } from './types';

export const toKebab = <T extends string>(str: T): CamelToKebab<T> => (
  str.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`) as CamelToKebab<T>
);

export const toSnake = <T extends string>(str: T): CamelToSnake<T> => (
  str.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}_${b.toLowerCase()}`) as CamelToSnake<T>
);

export const removeExtension = (str: string, depth = 1): string => {
  if (depth === 0) {
    return str;
  }
  const file = str.split('/').reverse()[0];
  if (!file.includes('.')) {
    return str;
  }
  return removeExtension(
    str.replace(file, file.split('.').slice(0, -1).join('.')),
    depth - 1,
  );
};

export const prefix = <T extends string, P extends string>(
  p: P,
  s: T,
): Prefix<T, P> => `${p}${s[0].toLowerCase()}${s.slice(1)}` as Prefix<T, P>;

export const padRight = (
  str: string,
  amount: number,
  char = ' ',
) => (
  [
    ...str.split(''),
    ...new Array(amount - str.length).fill(char),
  ].join('')
);

export const getPadAmount = (
  obj: Record<PropertyKey, any>,
) => Object.keys(obj)
  .reduce(
    (prev, it) => (
      prev.length > it.length
        ? prev
        : it
    ),
    '',
  ).length;
