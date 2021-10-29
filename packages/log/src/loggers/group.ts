import { stateMachine, isDeferred } from '../state';
import { raw } from './raw';
import { makeDebug, Levels } from './debug';

const { groupEnd, log: dirFunc } = raw;

export interface GroupFunction {
  (message: string, ...args: any[]): Promise<any>;
}
export interface GroupInterface extends GroupFunction {
  open: GroupFunction,
  closed: GroupFunction
}

export const makeGroup = (
  nameOrNames: string[] | string,
  level: Levels,
) => {
  const maker = makeDebug.bind(null, nameOrNames);

  const groupOpen = maker(level, console.group);
  const groupCollapsed = maker(level, console.groupCollapsed);

  const makeFunc = (groupFunc: ReturnType<typeof makeDebug>) => async (
    msg: string,
    ...args: any[]
  ) => stateMachine.wrap(
    async () => {
      groupFunc(msg);
      stateMachine.wrap(
        () => args.map(
          (it) => (it instanceof Promise
            ? async () => it
            : it),
        ).reduce(
          (promise, thing) => promise.then(
            async () => {
              if (typeof thing === 'function') {
                const value = await thing();
                if (isDeferred(value)) {
                  return value;
                }
                return dirFunc(value);
              }
              return dirFunc(thing);
            },
          ),
          Promise.resolve(),
        ),
      );
      groupEnd();
    },
  );

  const group = makeFunc(groupCollapsed) as GroupInterface;
  group.open = makeFunc(groupOpen);
  group.closed = makeFunc(groupCollapsed);

  return group;
};

export const makeGroupLogger = (
  nameOrNames: string[] | string,
) => {
  const maker = makeGroup.bind(null, nameOrNames);
  const log = maker('log');
  const info = maker('info');
  const error = maker('error');
  const warn = maker('warn');

  return {
    log,
    info,
    error,
    warn,
  };
};
