import { removeExtension } from '@memorize/utils';
import { makeLogger } from '../log';
import { global as config } from '../config/path';

export const fromPath = (
  filename: string,
) => {
  const rootRegex = new RegExp(`^${config.root}`);
  const path = removeExtension(filename.replace(rootRegex, ''), Infinity)
    .split('/')
    .filter(Boolean);
  return makeLogger(path);
};
