import * as packageJson from './package.json';

export const PACKAGE_JSON_SCRIPTS: Record<string, string> = {
  ...packageJson['scripts'],
};
