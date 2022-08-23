import { realpathSync, mkdtempSync, rmdirSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { execSync } from 'child_process';

export class TestWorldEnv {
  readonly rootDir = this.mktempd('angular-cli-e2e-');

  constructor() {
    console.log('TestWorldEnv::rootDir::', this.rootDir);
    this.init();
  }

  cleanup(): void {
    rmdirSync(this.rootDir, { recursive: true });
  }

  private init(): void {
    process.chdir(this.rootDir);
    const command = [
      'npx',
      '@angular/cli@latest',
      'new',
      'test-e2e',
      '--interactive=false',
      '--routing=false',
      '--style=scss',
      `--directory=./`,
    ].join(' ');

    console.log({ initCommand: command });
    execSync(command);
  }

  private mktempd(prefix: string): string {
    const tmpDir = mkdtempSync(path.join(tmpdir(), prefix));
    return realpathSync(tmpDir);
  }
}
