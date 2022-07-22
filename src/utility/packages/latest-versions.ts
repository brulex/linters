export const LATEST_VERSIONS: Record<string, string> = {
  ...require('./latest-versions/package.json')['dependencies'],
};
