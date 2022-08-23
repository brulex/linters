import { setupE2E } from '../utility/testing/setup-e2e';
import { TestWorldEnv } from '../utility/testing/test-world';
import * as fs from 'fs';

describe('[E2E] ng-add', () => {
  setupE2E();
  let world: TestWorldEnv;

  beforeEach(async () => {
    world = new TestWorldEnv();
  });

  afterEach(async () => {
    world.cleanup();
  });

  it('env should be initialized', () => {
    expect(fs.readdirSync(fs.realpathSync(world.rootDir))).toEqual([
      '.browserslistrc',
      '.editorconfig',
      '.git',
      '.gitignore',
      '.vscode',
      'README.md',
      'angular.json',
      'karma.conf.js',
      'node_modules',
      'package-lock.json',
      'package.json',
      'src',
      'tsconfig.app.json',
      'tsconfig.json',
      'tsconfig.spec.json',
    ]);
  });
});
