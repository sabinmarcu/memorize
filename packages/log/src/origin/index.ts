import { fromPath } from './path';

export { fromPath } from './path';
export { fromName } from './name';

export const log = fromPath(__filename);
// @ts-ignore
window.log = log; // eslint-disable-line
