import {
  wrap, get,
} from '@memorize/config';
import { config as baseConfig } from './base';
import { config as pathConfig } from './path';

export const config = wrap({
  base: baseConfig,
  path: pathConfig,
});

export const global = get(config);
