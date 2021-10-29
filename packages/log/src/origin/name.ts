import { makeLogger } from '../log';

export const fromName = (
  ...names: string[]
) => makeLogger(names);
