import { makeDebug } from './debug';

export const makeClassicLogger = (
  nameOrNames: string[] | string,
) => {
  const maker = makeDebug.bind(null, nameOrNames);
  const log = maker('log', console.log);
  const warn = maker('warn', console.warn);
  const error = maker('error', console.error);
  const info = maker('info', console.info);

  return {
    log,
    warn,
    error,
    info,
  };
};
