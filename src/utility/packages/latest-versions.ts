import * as packageJson from './package.json';

export const LATEST_VERSIONS: Record<string, string> = {
  ...packageJson['dependencies'],
};
