import { stateMachine } from './state';
import { makeClassicLogger } from './loggers/classic';
import { makeGroupLogger } from './loggers/group';
import { raw } from './loggers/raw';

export const makeLogger = (
  nameOrNames: string[] | string,
) => ({
  utils: {
    defer: stateMachine.wrap,
    run: stateMachine.run,
  },
  ...makeClassicLogger(nameOrNames),
  group: makeGroupLogger(nameOrNames),
  raw,
});
