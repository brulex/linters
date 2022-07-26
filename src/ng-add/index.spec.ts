import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

import * as path from 'path';

import { CONFIGURE_LINTERS_PACKAGES, PACKAGES_WITH_LATEST_VERSIONS, PACKAGE_JSON_SCRIPTS } from '../utility/packages';
import { ConfigureLintersSchema } from './schema';

interface PackageJson {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const collectionPath = path.join(__dirname, '../collection.json');
const testRunner = new SchematicTestRunner('schematics', collectionPath);

const DEFAULT_OPTIONS: ConfigureLintersSchema = { project: 'bar' };
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

  const runSchematic = async (tree: Tree, options: ConfigureLintersSchema = DEFAULT_OPTIONS) => {
    return await testRunner.runSchematicAsync('ng-add', { ...options }, tree).toPromise();
  };

  it('fails with missing tree', async () => {
    expect(runSchematic(Tree.empty())).rejects.toThrow();
  });

  it('fails if angular project does not exists', async () => {
    expect(runSchematic(appTree, { project: 'not-exists' })).rejects.toThrow();
  });

  it.each`
    file                   | contentToCheck
    ${'.eslintrc.json'}    | ${[/eslint:recommended/]}
    ${'.stylelintrc.json'} | ${[/stylelint-config-recommended-scss/]}
    ${'.prettierrc.json'}  | ${[/arrowParens": "avoid/, /"files": "\*\.component.html",/]}
  `('should create $file config file', async ({ file, contentToCheck }: { file: string; contentToCheck: RegExp[] }) => {
    const filePath = `/projects/bar/${file}`;
    const tree = await runSchematic(appTree);
    expect(tree.files).toContain(filePath);
    const moduleContent = tree.readContent(filePath);
    contentToCheck.forEach(check => {
      expect(moduleContent).toMatch(check);
    });
  });

  it('should contain all packages from latest versions', async () => {
    expect(Object.keys(PACKAGES_WITH_LATEST_VERSIONS).sort()).toEqual(CONFIGURE_LINTERS_PACKAGES.sort());
  });

  it('should install additional packages', async () => {
    const filePath = `/package.json`;
    const tree = await runSchematic(appTree);
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

      expect(packageJson.devDependencies[packageName]).toEqual(PACKAGES_WITH_LATEST_VERSIONS[packageName]);
    });
  });

  it('should add linting scripts', async () => {
    const filePath = `/package.json`;
    const tree = await runSchematic(appTree);
    const moduleContent = tree.readContent(filePath);
    const packageJson: PackageJson = JSON.parse(moduleContent);

    Object.entries(PACKAGE_JSON_SCRIPTS).forEach(([scriptName, script]) => {
      expect(packageJson.scripts[scriptName]).toEqual(script);
    });
  });

  it.each`
    file                   | content
    ${'.eslintrc.json'}    | ${'{ "extends": "minimal" }'}
    ${'.stylelintrc.json'} | ${'{ "extends": "stylelint-config-standard" }'}
    ${'.prettierrc.json'}  | ${'{ "tabWidth": 4, "semi": false, "singleQuote": true }'}
  `('should overwrite $file config file', async ({ file, content }: { file: string; content: string }) => {
    const filePath = `/projects/bar/${file}`;
    appTree.create(filePath, content);
    expect(appTree.readContent(filePath)).toContain(content);
    const tree = await runSchematic(appTree);
    const moduleContent = tree.readContent(filePath);
    expect(moduleContent).not.toMatch(content);
  });
});
