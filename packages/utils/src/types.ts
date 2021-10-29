export type Upper = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' |
'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export type CamelToKebab<T extends string> =
  T extends `${infer L}${Upper}${infer R}`
    ? T extends `${L}${infer U}${R}`
      ? `${L}-${Lowercase<U>}${CamelToKebab<R>}`
      : T
    : T;

export type CamelToSnake<T extends string> =
  T extends `${infer L}${Upper}${infer R}`
    ? T extends `${L}${infer U}${R}`
      ? `${L}_${Lowercase<U>}${CamelToKebab<R>}`
      : T
    : T;

export type Prefix<T extends string, P extends string> =
  `${P}${Uncapitalize<T>}`;
