import { nanoid } from 'nanoid';

export interface Subscriber<T extends any = any> {
  (value: T): void
}
export interface Subscription {
  (): void;
}
export interface Setter<T extends any = any> {
  (old: T): T
}
export type NextSubject<T extends any = any> =
  Setter<T> | T;
export interface Subject<T extends any = any> {
  readonly value: T
  subscribe(
    subscriber: Subscriber<T>,
    trigger?: boolean
  ): Subscription
  next(value: NextSubject<T>): void
}
export type SubscriberList<T extends any = any> = (
  Record<PropertyKey, Subscriber<T>>
);
export type ReadonlySubject<T extends any = any> = (
  Omit<Subject<T>, 'next'>
);

export const subject = <T extends any = any>(
  initialValue: T,
): Subject<T> => {
  let value: T = initialValue;
  const subscribers: SubscriberList = {};
  const next: Subject<T>['next'] = (input) => {
    value = typeof input === 'function'
      ? (input as Setter<T>)(value)
      : input;
    Object.values(subscribers)
      .forEach((subscriber) => subscriber(value));
  };
  const subscribe: Subject<T>['subscribe'] = (
    subscriber: Subscriber<T>,
    trigger?: boolean,
  ) => {
    const id = nanoid();
    subscribers[id] = subscriber;
    if (trigger) {
      subscriber(value);
    }
    return () => {
      delete subscribers[id];
    };
  };

  return {
    get value() { return value; },
    next,
    subscribe,
  };
};

export type TypeOfSubject<T extends Subject> =
  T extends Subject<infer R>
    ? R
    : never;

export type BatchSubjectInput = Record<PropertyKey, Subject>;
export type BatchSubjectOutput<S extends BatchSubjectInput> = {
  readonly [K in keyof S]: TypeOfSubject<S[K]>
};
export interface BatchSubject<
  S extends BatchSubjectInput,
> extends ReadonlySubject<BatchSubjectOutput<S>> {}

export const batch = <S extends BatchSubjectInput>(
  subjects: S,
): BatchSubject<S> => {
  const entries = Object.entries(subjects);
  const batchSubject = subject(
    entries.reduce<BatchSubjectOutput<S>>(
      (acc, [key, subj]) => ({
        ...acc,
        [key]: subj.value,
      }),
      {} as any,
    ),
  );
  entries.map(
    ([key, subj]) => subj.subscribe(
      (val) => {
        batchSubject.next((old) => ({
          ...old,
          [key]: val,
        }));
      },
    ),
  );
  return {
    get value() { return batchSubject.value; },
    subscribe: batchSubject.subscribe,
  } as unknown as BatchSubject<S>;
};
