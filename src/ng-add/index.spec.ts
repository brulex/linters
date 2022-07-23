import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { ConfigureLintersSchema } from './schema';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';
import { CONFIGURE_LINTERS_PACKAGES, LATEST_VERSIONS } from '../utility/packages';
import { PACKAGE_JSON_SCRIPTS } from '../utility/packages/scripts';

interface PackageJson {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const collectionPath = path.join(__dirname, '../collection.json');
const testRunner = new SchematicTestRunner('schematics', collectionPath);

const defaultOptions: ConfigureLintersSchema = { project: 'bar' };
const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '6.0.0',
};

const appOptions: ApplicationOptions = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  skipTests: false,
  skipPackageJson: false,
};

describe('ng-add', () => {
  let appTree: UnitTestTree;
  beforeEach(async () => {
    appTree = await testRunner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    appTree = await testRunner
      .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree)
      .toPromise();
  });

  it('fails with missing tree', async () => {
    expect(testRunner.runSchematicAsync('ng-add', { ...defaultOptions }, Tree.empty()).toPromise()).rejects.toThrow();
  });

  it('fails if angular project does not exists', async () => {
    expect(testRunner.runSchematicAsync('ng-add', { project: 'not-exists' }, appTree).toPromise()).rejects.toThrow();
  });

  it.each`
    file                   | contentToCheck
    ${'.eslintrc.json'}    | ${[/eslint:recommended/]}
    ${'.stylelintrc.json'} | ${[/stylelint-config-recommended-scss/]}
    ${'.prettierrc.json'}  | ${[/arrowParens": "avoid/, /"files": "\*\.component.html",/]}
  `('should create $file config file', async ({ file, contentToCheck }: { file: string; contentToCheck: RegExp[] }) => {
    const options = { ...defaultOptions };
    const filePath = `/projects/bar/${file}`;
    const tree = await testRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
    expect(tree.files).toContain(filePath);
    const moduleContent = tree.readContent(filePath);
    contentToCheck.forEach(check => {
      expect(moduleContent).toMatch(check);
    });
  });

  it('should contain all packages from latest versions', async () => {
    expect(Object.keys(LATEST_VERSIONS).sort()).toEqual(CONFIGURE_LINTERS_PACKAGES.sort());
  });

  it('should install additional packages', async () => {
    const options = { ...defaultOptions };
    const filePath = `/package.json`;
    const tree = await testRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
    const moduleContent = tree.readContent(filePath);
    const packageJson: PackageJson = JSON.parse(moduleContent);
    expect(CONFIGURE_LINTERS_PACKAGES.length).toBeGreaterThan(1);

    CONFIGURE_LINTERS_PACKAGES.forEach(packageName => {
      const toBeInDeps = (depName: string) => `${packageName} to be in ${depName}`;
      const notToBeInDeps = (depName: string) => `${packageName} not to be in ${depName}`;
      expect(
        packageName in packageJson.devDependencies ? toBeInDeps('devDependencies') : notToBeInDeps('devDependencies'),
      ).toEqual(toBeInDeps('devDependencies'));
      expect(
        packageName in packageJson.dependencies ? toBeInDeps('dependencies') : notToBeInDeps('dependencies'),
      ).toEqual(notToBeInDeps('dependencies'));

      expect(packageJson.devDependencies[packageName]).toEqual(LATEST_VERSIONS[packageName]);
    });
  });

  it('should add linting scripts', async () => {
    const options = { ...defaultOptions };
    const filePath = `/package.json`;
    const tree = await testRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
    const moduleContent = tree.readContent(filePath);
    const packageJson: PackageJson = JSON.parse(moduleContent);

    Object.entries(PACKAGE_JSON_SCRIPTS).forEach(([scriptName, script]) => {
      expect(packageJson.scripts[scriptName]).toEqual(script);
    });
  });
});
