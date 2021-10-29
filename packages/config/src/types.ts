export const ConfigID = Symbol('ConfigID');
export const ConfigShape = Symbol('__shape');
export const SetterKeys = Symbol('__setters');

export const OwnProperties = Symbol('own');
export const ProxyProperties = Symbol('proxy');
export const DynamicProperties = Symbol('dynamic');

export type KeyValue<T extends Record<PropertyKey, any>> = {
  [P in keyof T]: { key: P, value: T[P] }
}[keyof T];

export type Obj = Record<PropertyKey, any>;
export type KV = { key: PropertyKey, value: any };
export type IsIConfig<T extends Obj> =
  T extends IConfig
    ? never
    : T;
export type IsWithoutSetters<T extends Obj> =
  Extract<KeyValue<T>, { key: PropertyToSetter<string> }> extends never
    ? T
    : never;
export type ValidObj<T extends Obj> =
  IsIConfig<T> & IsWithoutSetters<T>;

export type OwnPropertyKey = Exclude<PropertyKey, symbol>;

export interface IConfig<
  K extends Obj = Obj,
  V extends PropertyKey = PropertyKey,
> {
  readonly [ConfigID]: PropertyKey,
  readonly [ConfigShape]: K,
  readonly [SetterKeys]: V
}

export interface IConfigCache<
  O extends any = any,
  P extends any = any,
  D extends any = any,
> {
  [OwnProperties]: O
  [ProxyProperties]: P
  [DynamicProperties]: D
}

export interface ConfigCache<
  T extends KV,
> extends IConfigCache<
  OwnPropertiesType<T>,
  ProxyPropertiesType<T>,
  DynamicPropertiesType<T>
> {}

export interface RawConfig<
  T extends KV,
> extends IConfigCache<
  OnlySetters<T>[],
  OnlyProxies<T>[],
  OnlyDynamicSetters<T>[]
> {}

export type SetterToProperty<
  S extends OwnPropertyKey,
> = S extends string
  ? S extends `set${infer P}`
    ? Uncapitalize<P>
    : never
  : S;

export type PropertyToSetterString<S extends string> = `set${Capitalize<S>}`;
export type PropertyToSetterNumber<S extends number> = `set${S}`;
export type PropertyToSetter<
  S extends OwnPropertyKey,
> = S extends string
  ? PropertyToSetterString<S>
  : PropertyToSetterNumber<S & number>;

export type IsDynamicKey<
  T extends KV,
> = Extract<T, { key: symbol }>;

export type IsSetterKey<
  T extends KV,
> = Exclude<T, { key: symbol }>;

export type IsProxyKey<
  T extends KV,
> = Extract<T, { value: IConfig }>;

export type IsOwnKey<
  T extends KV,
> = Exclude<T, { value: IConfig }>;

export type OnlySetters<
  T extends KV,
> = IsSetterKey<IsOwnKey<T>>;

export type OnlyDynamicSetters<
  T extends KV,
> = IsDynamicKey<IsOwnKey<T>>;

export type OnlyProxies<
  T extends KV,
> = IsProxyKey<T>;

export type DynamicPropertiesType<T extends KV> = {
  [key in OnlyDynamicSetters<T>['key']]:
  Extract<OnlyDynamicSetters<T>, { key: key }>['value']
};

export type OwnPropertiesType<T extends KV> = {
  [key in OnlySetters<T>['key']]:
  Extract<OnlySetters<T>, { key: key }>['value']
};

export type ProxyPropertiesType<T extends KV> = {
  [key in OnlyProxies<T>['key']]:
  ConfigCache<Extract<OnlyProxies<T>, { key: key }>['value']>
};

export type PropertiesToObject<T extends KV> = {
  [key in T['key']]: Extract<T, { key: key }>['value']
};

export type OwnPropertiesSetters<T extends KV> = {
  [key in OnlySetters<T>['key'] as PropertyToSetter<key & OwnPropertyKey>]:
  (value: Extract<OnlySetters<T>, { key: key }>['value']) => void
};

export type DynamicSetterFunction<
  T extends { key: Extract<PropertyKey, symbol>, value: any },
> = {
  set<K extends T['key']>(
    key: K,
    value: Extract<T, { key: K }>['value']
  ): void;
};

export type NeedsDynamicSetter<T extends KV> =
    OnlyDynamicSetters<T> extends never
      ? {}
      : DynamicSetterFunction<OnlyDynamicSetters<T>>;

export type ProxiesSetters<
  T extends KV,
> = {
  [key in OnlyProxies<T>['key']]:
  Extract<OnlyProxies<T>, { key: key }>['value']
};

export type PublicConfigRaw<
  T extends KV,
> =
& OwnPropertiesSetters<T>
& NeedsDynamicSetter<T>
& ProxiesSetters<T>;

export type PublicConfigIConfig<
  T extends KV,
  O extends Obj,
> = IConfig<
  O,
  KeyValue<PublicConfigRaw<T>>['key']
>;

export type PublicConfigCombined<
  T extends KV,
  K extends Obj,
> =
& PublicConfigRaw<T>
& PublicConfigIConfig<T, K>;

export type PublicConfig<
  T extends Obj = Obj,
> =
& PublicConfigCombined<KeyValue<StripObj<T>>, T>
& UnstripPrivateObj<T>;

export type ReducePublicConfigToSource<T extends Obj> =
  T extends PublicConfig
    ? PublicConfigSource<T>
    : T;

export type StripPublicConfigSource<T extends Obj> = {
  [key in keyof T]: ReducePublicConfigToSource<T[key]>
};

export type PublicConfigSourceRaw<
  T extends PublicConfig,
> = T extends PublicConfig<infer K>
  ? StripPublicConfigSource<StripObj<K>> & UnstripPublicObj<K>
  : never;

export type UnionToIntersection<U> =
  (U extends any ? (k: U)=> void : never) extends (
    (k: infer I) => void
  ) ? I : never;

export type PublicConfigSource<
  T extends PublicConfig,
> = UnionToIntersection<PublicConfigSourceRaw<T>>;

export type ConfigSection =
| typeof OwnProperties
| typeof ProxyProperties
| typeof DynamicProperties;

export type StripObj<T extends Obj> =
  T extends IConfig<any, infer R>
    ? Omit<T, R | keyof IConfig>
    : T;

export type UnstripPrivateObj<T extends Obj> =
  T extends IConfig<any, infer R>
    ? Pick<T, R>
    : {};

export type UnstripPublicObj<T extends Obj> =
  T extends IConfig<infer R>
    ? R
    : {};
