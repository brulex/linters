import * as packageJson from './package.json';

export const PACKAGES_WITH_LATEST_VERSIONS: Record<string, string> = {
  ...packageJson['dependencies'],
};
