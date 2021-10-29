import debug from 'debug';
import { nanoid } from 'nanoid';
import { global as config } from './config/base';

const warn = debug([config.prefix, 'warn', 'debug', 'machine'].join(config.delimiter));
warn.log = console.warn.bind(null);
const error = debug([config.prefix, 'error', 'debug', 'machine'].join(config.delimiter));
warn.log = console.error.bind(null);

type AFunc = (chainKey?: string) => Promise<any>;
type QFunc = AFunc | Deferred;

type QueueKey<T extends string> = `debugQueueWrapper:${T}`;
const makeQueueKey = <T extends string>(
  id: T,
): QueueKey<T> => `debugQueueWrapper:${id}`;
const getQueueKey = <T extends string>(
  key: QueueKey<T>,
): T | undefined => key.match(/debugQueueWrapper:([a-zA-Z0-9_-]+)/)?.[1] as T;

const DEFERRED = '__deferred';
type Deferred = AFunc & { [DEFERRED]: string };
const makeDefer = (
  wrapper: AFunc,
  chainKey: string,
): Deferred => {
  const deferred = () => wrapper(chainKey);
  // eslint-disable-next-line no-param-reassign
  (deferred as any)[DEFERRED] = true;
  return deferred as Deferred;
};
export const isDeferred = (input: any): input is Deferred => (
  input && typeof input[DEFERRED] !== 'undefined'
);

export const makeMachine = () => {
  const queues: Record<string, QFunc[]> = {};
  const tryAndGetQueue = (print?: boolean): {
    qId: string,
    q: QFunc[]
  } | undefined => {
    let qId: string | undefined;
    try {
      throw new Error();
    } catch (e) {
      qId = getQueueKey(`${(e as Error).stack}` as QueueKey<string>);
      if (print) {
        console.trace();
        console.log(qId, `${(e as Error).stack}`);
      }
    }
    if (qId && qId in queues) {
      return {
        q: queues[qId],
        qId,
      };
    }
    return undefined;
  };
  const start = () => {
    const id = nanoid();
    const q: QFunc[] = [];
    queues[id] = q;
    return id;
  };
  const run = (func: (key?: string) => void) => {
    const queue = tryAndGetQueue(true);
    console.log(queue, func);
    if (queue) {
      const { q, qId } = queue;
      q.push(async () => func(qId));
    } else {
      func();
    }
  };
  const end = async (id: string, final: boolean) => {
    if (!(id in queues)) {
      error('Queue does not exist!');
    }
    const q = queues[id];
    const queue = (await Promise.all(
      q.map(
        async (it) => {
          if (isDeferred(it)) {
            const value = await it() as any;
            return value ? [...value] : undefined;
          }
          return [it];
        },
      ),
    )).flat(Infinity).filter(Boolean);
    console.log(queue);
    if (final) {
      return queue.reduce(
        (promise, it) => promise.then(it as any),
        Promise.resolve(),
      );
    }
    return queue;
  };
  const ensure = async (func: AFunc) => {
    const chainKey = tryAndGetQueue(false);
    if (chainKey) {
      const deferred = makeDefer(func, chainKey.qId);
      chainKey.q.push(deferred);
      return deferred;
    }
    return func();
  };
  const wrap = async (func: AFunc) => {
    const id = start();
    const key = makeQueueKey(id);
    const runner = async (chainKey?: string) => {
      const wrapper = async () => {
        await func();
      };
      Object.defineProperty(
        wrapper,
        'name',
        {
          value: key,
        },
      );
      await wrapper();
      return end(id, !chainKey);
    };
    return ensure(runner);
  };
  return {
    run,
    wrap,
  };
};

export const stateMachine = makeMachine();
export type StateMachine = ReturnType<typeof makeMachine>;

export const genericRun = <T extends (...args: any[]) => any>(func: T) => (
  (...args: Parameters<T>): void => (
    stateMachine.run(() => func(...args))
  )
);
