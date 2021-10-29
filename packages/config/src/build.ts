import {
  KeyValue,
  Obj,
  OnlySetters,
  OnlyProxies,
  OnlyDynamicSetters,
  ConfigID,
  OwnProperties,
  ProxyProperties,
  DynamicProperties,
  RawConfig,
  ConfigCache,
  PublicConfig,
  PublicConfigSource,
  ValidObj,
} from './types';

import {
  raw as rawCache,
  config as configCache,
  getter,
  setter,
  source,
} from './cache';

import {
  createPublicInterface,
} from './public';
import {
  createPrivateInterface,
} from './private';

import {
  isConfig,
  keyValue,
  onlySetters,
  onlyProxies,
  onlyDynamicSetters,
  propsToObject,
  areEqual,
  getSubset,
} from './utils';

export const processConfig = <
  T extends Obj,
  K extends KeyValue<T> = KeyValue<T>,
>(
  config: T,
  extra: PropertyKey | undefined,
): PublicConfig<K> => {
  const id = source.provision(config);
  const props = keyValue(config);
  const ownProps = onlySetters(props);
  const proxyProps = onlyProxies(props);
  const dynamicProps = onlyDynamicSetters(props);
  const raw: RawConfig<K> = {
    [OwnProperties]: ownProps as OnlySetters<K>[],
    [ProxyProperties]: proxyProps as OnlyProxies<K>[],
    [DynamicProperties]: dynamicProps as OnlyDynamicSetters<K>[],
  };
  const cache: ConfigCache<K> = {
    [OwnProperties]: propsToObject(ownProps),
    [ProxyProperties]: propsToObject(proxyProps),
    [DynamicProperties]: propsToObject(dynamicProps),
  };
  rawCache.provision(raw, id);
  configCache.provision(cache, id);
  createPrivateInterface<T, K>(id, config, extra);
  const result = createPublicInterface<T, K>(id, extra);
  Object.defineProperty(
    result,
    ConfigID,
    {
      value: id,
      enumerable: true,
      writable: false,
      configurable: false,
    },
  );
  setter.provision(result as any, id);
  return result;
};

export const wrap = <T extends Obj>(
  src: T & ValidObj<T>,
): PublicConfig<T> => {
  let realSource: T = src;
  let extra: PropertyKey | undefined;
  if (isConfig(src)) {
    const publicSource = setter.get(src) as PublicConfig<T>;
    if (areEqual(src, publicSource)) {
      return publicSource;
    }
    const subset = getSubset(src, publicSource);
    if (subset) {
      realSource = subset;
      extra = src[ConfigID];
    }
  }
  return processConfig(realSource, extra) as any;
};

export const get = <
  T extends PublicConfig<Obj>,
  R extends PublicConfigSource<T> = PublicConfigSource<T>,
>(
  pubInt: T,
): Readonly<R> => getter.get(pubInt) as R;
