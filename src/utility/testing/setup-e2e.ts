import { initRegistry, NpmRegistry } from './registry';
import { resolve as resolvePath } from 'path';
import packageJson from '../../../package.json';

const folderWithPackage = resolvePath('./');
export function setupE2E(): NpmRegistry {
  const registry = initRegistry(({ runNpmCommand }) => {
    runNpmCommand('run build');
    runNpmCommand(`publish ${folderWithPackage} --access=public --force`);
    const { name, version } = packageJson;
    const pkgName = `${name}@${version}`;
    const info = JSON.parse(runNpmCommand(`info ${pkgName} --json`)) as any;
    const npmVersion = runNpmCommand(`-v`);
    expect(info.name).toBe(name);
    expect(info.version).toBe(version);
    expect(Number(npmVersion.split('.')[0])).toBeGreaterThan(7);
  });
  return registry;
}
