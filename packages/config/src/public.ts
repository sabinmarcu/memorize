import {
  KeyValue,
  Obj,
  ConfigID,
  OwnProperties,
  ProxyProperties,
  DynamicProperties,
  OnlySetters,
  OwnPropertyKey,
  RawConfig,
  ConfigCache,
  OnlyProxies,
  PublicConfig,
  DynamicSetterFunction,
  OnlyDynamicSetters,
} from './types';
import {
  propertyToSetter,
} from './utils';
import {
  raw,
  config,
  setter,
} from './cache';

const ownPropsToSetters = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  result: PublicConfig<K>,
): void => {
  const source = raw.get<RawConfig<K>>(result)[OwnProperties];
  source.forEach(
    ({ key }: { key: OnlySetters<K>['key'] }) => {
      const cache = config.get<ConfigCache<K>>(result)[OwnProperties];
      Object.defineProperty(
        result,
        propertyToSetter(key as OwnPropertyKey),
        {
          value: (
            value: Extract<OnlySetters<K>, typeof key>['value'],
          ) => {
          // eslint-disable-next-line no-param-reassign
            cache[key] = value;
          },
          configurable: false,
          writable: false,
          enumerable: true,
        },
      );
    },
  );
};

const dynamicPropsToSetterFunction = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  result: PublicConfig<K>,
) => {
  const source = raw.get<RawConfig<K>>(result)[DynamicProperties];
  if (source.length === 0) {
    return;
  }
  const cache = config.get<ConfigCache<K>>(result)[DynamicProperties];
  const Dynamics = cache;
  const setterFunction: DynamicSetterFunction<OnlyDynamicSetters<K>>['set'] = (
    key,
    value,
  ) => {
    if (!(key in Dynamics)) {
      throw new Error(`Key ${key} is not a part of this configuration!`);
    }
    // eslint-disable-next-line no-param-reassign
    Dynamics[key] = value;
  };
  Object.defineProperty(
    result,
    'set',
    {
      configurable: false,
      writable: false,
      enumerable: true,
      value: setterFunction,
    },
  );
};

const proxyPropsToSetters = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  result: PublicConfig<K>,
) => {
  const source = raw.get<RawConfig<K>>(result)[ProxyProperties];
  return source.forEach(
    ({ key }: { key: OnlyProxies<K>['key'] }) => {
      const cache = config.get<ConfigCache<K>>(result)[ProxyProperties];
      Object.defineProperty(
        result,
        key,
        {
          get: () => cache[key],
          configurable: false,
          enumerable: true,
        },
      );
    },
  );
};

export const createPublicInterface = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  id: PropertyKey,
  extra: PropertyKey | undefined,
) => {
  let spread: any;
  if (extra) {
    spread = setter.get(extra);
  }
  const result = {
    ...spread,
    [ConfigID]: id,
  } as PublicConfig<K>;
  ownPropsToSetters<T, K>(result);
  proxyPropsToSetters<T, K>(result);
  dynamicPropsToSetterFunction<T, K>(result);
  return result;
};
