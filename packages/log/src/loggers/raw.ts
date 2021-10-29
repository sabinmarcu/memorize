import { genericRun } from '../state';

export const makeRawLogger = () => {
  const log = genericRun(console.log);
  const warn = genericRun(console.warn);
  const error = genericRun(console.error);
  const info = genericRun(console.info);
  const dir = genericRun(console.dir);
  const group = genericRun(console.group);
  const groupCollapsed = genericRun(console.groupCollapsed);
  const groupEnd = genericRun(console.groupEnd);

  return {
    log,
    warn,
    error,
    info,
    dir,
    group,
    groupCollapsed,
    groupEnd,
  };
};

export const raw = makeRawLogger();
