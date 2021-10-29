import {
  KeyValue,
  KV,
  Obj,
  ConfigID,
  IConfig,
  IsSetterKey,
  IsDynamicKey,
  IsProxyKey,
  IsOwnKey,
  OnlySetters,
  OnlyDynamicSetters,
  OnlyProxies,
  PropertyToSetter,
  OwnPropertyKey,
  PropertiesToObject,
} from './types';

export const propertyToSetter = <
  S extends OwnPropertyKey,
>(
  property: S,
): PropertyToSetter<S> => {
  if (typeof property === 'string') {
    return `set${property[0].toUpperCase()}${property.slice(1)}` as any as PropertyToSetter<S>;
  }
  return `set${property}` as PropertyToSetter<S>;
};

export const keyValue = <T extends Obj>(
  source: T,
): KeyValue<T>[] => [
  ...Object.getOwnPropertyNames(source),
  ...Object.getOwnPropertySymbols(source),
].reduce(
  (acc, key) => [
    ...acc,
    {
      key,
      value: source[key],
    },
  ],
  [] as any,
) as KeyValue<T>[];

export const isSetterKey = <
  T extends KV,
>(
  source: T,
): source is IsSetterKey<T> => (
  typeof source.key === 'string'
);

export const onlySetterKeys = <
  T extends KV,
>(
  source: T[],
): IsSetterKey<T>[] => (
  source.filter(isSetterKey)
);

export const isDynamicKey = <
  T extends KV,
>(
  source: T,
): source is IsDynamicKey<T> => (
  !isSetterKey(source)
);

export const onlyDynamicKeys = <
  T extends KV,
>(
  source: T[],
): IsDynamicKey<T>[] => (
  source.filter(isDynamicKey)
);

export const isProxyKey = <
  T extends KV,
>(
  source: T,
): source is IsProxyKey<T> => (
  !!source.value[ConfigID]
);

export const onlyProxyKeys = <
  T extends KV,
>(
  source: T[],
): IsProxyKey<T>[] => (
  source.filter(isProxyKey)
);

export const isOwnKey = <
  T extends KV,
>(
  source: T,
): source is IsOwnKey<T> => (
  !isProxyKey(source)
);

export const onlyOwnKeys = <
  T extends KV,
>(
  source: T[],
): IsOwnKey<T>[] => (
  source.filter(isOwnKey)
);

export const onlySetters = <
  T extends KV,
>(
  source: T[],
): OnlySetters<T>[] => (
  onlySetterKeys(onlyOwnKeys(source))
);

export const onlyDynamicSetters = <
  T extends KV,
>(
  source: T[],
): OnlyDynamicSetters<T>[] => (
  onlyDynamicKeys(onlyOwnKeys(source))
);

export const onlyProxies = <
  T extends KV,
>(
  source: T[],
): OnlyProxies<T>[] => (
  onlyProxyKeys(source)
);

export const isConfig = (
  it: any,
): it is IConfig => typeof it[ConfigID] !== 'undefined';

export const propsToObject = <
  T extends KV,
>(
  src: T[],
): PropertiesToObject<T> => src.reduce(
  (acc, { key, value }) => ({
    ...acc,
    [key]: value,
  }),
  {},
) as PropertiesToObject<T>;

export const allKeys = (
  obj: Obj,
) => new Set<PropertyKey>([
  ...Object.getOwnPropertySymbols(obj),
  ...Object.keys(Object.getOwnPropertyDescriptors(obj)),
]) as Set<PropertyKey>;

export const areEqual = (
  A: Obj,
  B: Obj,
): boolean => {
  const AKeys = allKeys(A);
  const BKeys = allKeys(B);
  if (AKeys.size !== BKeys.size) {
    return false;
  }
  return [...AKeys].every((it) => BKeys.has(it));
};

export const getSubset = (
  A: Obj,
  B: Obj,
): Obj | undefined => {
  const AKeys = allKeys(A);
  const BKeys = allKeys(B);
  if ([...BKeys].every((it) => AKeys.has(it))) {
    const proc = [...AKeys].filter((it) => !BKeys.has(it))
      .reduce((acc, it) => ({
        ...acc,
        [it]: A[it],
      }), {});
    return proc;
  }
  return undefined;
};
