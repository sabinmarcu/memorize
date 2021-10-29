import { nanoid } from 'nanoid';
import {
  Obj,
  ConfigID,
  IConfig,
  RawConfig,
  ConfigCache,
  PublicConfig,
} from './types';

import {
  isConfig,
} from './utils';

export const makeCache = <
  T extends any,
>() => {
  const cache: Map<PropertyKey, any> = new Map();

  const provision = <
    K extends T = T,
  >(
    config: K,
    optionalId?: PropertyKey,
  ): PropertyKey => {
    const id = isConfig(config)
      ? config[ConfigID]
      : optionalId || nanoid();
    cache.set(id, config);
    return id;
  };

  const retrieveByID = <
    K extends T = T,
  >(
    id: PropertyKey,
  ): K => {
    if (!cache.has(id)) {
      throw new Error('Config has not been provisioned!');
    }
    return cache.get(id);
  };

  const get = <
    K extends T = T,
  >(
    config: PropertyKey | IConfig,
  ): K => {
    const id = isConfig(config)
      ? config[ConfigID]
      : config;

    return retrieveByID(id);
  };

  return {
    provision,
    get,
  };
};

export const source = makeCache<Obj>();
export const raw = makeCache<RawConfig<any>>();
export const config = makeCache<ConfigCache<any>>();
export const getter = makeCache<Obj>();
export const setter = makeCache<PublicConfig<any>>();
