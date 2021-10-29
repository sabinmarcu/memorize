import {
  KeyValue,
  Obj,
  ConfigSection,
  ConfigCache,
  OwnProperties,
  ProxyProperties,
  DynamicProperties,
} from './types';
import {
  source,
  getter,
  config,
} from './cache';
import {
  isConfig,
} from './utils';

const sections: ConfigSection[] = [
  OwnProperties,
  ProxyProperties,
  DynamicProperties,
];
const resolveKeyToSection = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  id: PropertyKey,
  key: PropertyKey,
): ConfigSection => {
  const cache = config.get<ConfigCache<K>>(id);
  const result = sections.find(
    (prop: ConfigSection) => key in cache[prop],
  );
  return result!;
};

const keyToGetter = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  id: PropertyKey,
  key: PropertyKey,
) => {
  const section = resolveKeyToSection<T, K>(id, key);
  const getFunc = () => {
    const cache = config.get<ConfigCache<K>>(id);
    return (cache[section] as any)[key];
  };
  if (section === ProxyProperties) {
    return () => {
      const pointer = getFunc();
      if (isConfig(pointer)) {
        const cache = getter.get<T[typeof key]>(pointer);
        return cache;
      }
      return undefined;
    };
  }
  return getFunc;
};

export const createPrivateInterface = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  id: PropertyKey,
  src: T,
  extra: PropertyKey | undefined,
): T => {
  const result = {} as T;
  Object.keys(src)
    .forEach(
      (key) => {
        Object.defineProperty(
          result,
          key,
          {
            get: keyToGetter<T, K>(id, key),
            enumerable: true,
            configurable: false,
          },
        );
      },
    );
  if (extra) {
    const spread = source.get(extra);
    Object.keys(spread)
      .forEach(
        (key) => {
          Object.defineProperty(
            result,
            key,
            {
              get: keyToGetter<T, K>(extra, key),
              enumerable: true,
              configurable: false,
            },
          );
        },
      );
  }
  getter.provision(result, id);
  return result;
};
