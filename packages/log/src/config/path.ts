import { wrap, get } from '@memorize/config';

export const config = wrap({
  root: '',
});

export const global = get(config);
