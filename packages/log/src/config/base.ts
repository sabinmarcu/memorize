import { wrap, get } from '@memorize/config';

export const config = wrap({
  delimiter: ':',
  prefix: 'app',
  log: console.log,
});

export const global = get(config);
