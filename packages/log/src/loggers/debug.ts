import dbg from 'debug';
import { global as config } from '../config/base';
import { stateMachine } from '../state';

if (process.env.NODE_ENV !== 'production') {
  if (!config.prefix) {
    dbg.enable('*');
  } else {
    dbg.enable(`${config.prefix}:*`);
  }
  window.debug = dbg;
}

export type Levels = 'error' | 'warn' | 'info' | 'log';
export const makeDebug = (
  nameOrNames: string[] | string,
  level: Levels,
  log = config.log,
) => {
  const names = typeof nameOrNames === 'string'
    ? [nameOrNames]
    : nameOrNames;

  const namespace = [
    config.prefix,
    level,
    ...names,
  ].filter(Boolean).join(config.delimiter);

  const instance = dbg(namespace);
  instance.log = log.bind(null);

  return (...args: Parameters<typeof instance>) => (
    stateMachine.run((key?: string) => instance(...args, key))
  );
};
