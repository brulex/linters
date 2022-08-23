import getPort from 'get-port';
import { ChildProcess, fork, execSync } from 'child_process';
import { resolve as resolvePath } from 'path';

const verdaccioConfigPath = resolvePath('./verdaccio.yaml');

export interface NpmRegistry {
  port: () => number;
  child: () => ChildProcess;
  runNpmCommand: (...commands: string[]) => string;
}

export function initRegistry(cb: (registry: NpmRegistry) => void): NpmRegistry {
  let child: ChildProcess;
  let port: number;
  const registry: NpmRegistry = {
    port: () => port,
    child: () => child,
    runNpmCommand: (...command) => runNpmCommand(command.join(' '), port),
  };

  beforeAll(async () => {
    port = await getPort();
    child = await runRegistry(['-c', verdaccioConfigPath, '-l', `${port}`]);
    npmLogin('foo', 'bar', port);
    cb(registry);
  });

  afterAll(() => {
    child.kill();
  });

  return registry;
}

export function npmLogin(user: string, password: string, port: number): void {
  execSync(`npx npm-cli-login -u ${user} -p ${password} -e test@domain.test -r http://localhost:${port}`);
}

export function runNpmCommand(command: string, port: number): string {
  const cmd = `npm ${command} --registry http://localhost:${port} --json`;
  console.log('runNpmCommand:', cmd);
  const buffer = execSync(cmd);
  return buffer.toString();
}

function runRegistry(args: string[] = [], childOptions = {}): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childFork = fork(require.resolve('verdaccio/bin/verdaccio'), args, childOptions);

    childFork.on('message', (msg: { verdaccio_started: boolean }) => {
      if (msg.verdaccio_started) {
        resolve(childFork);
      }
    });

    childFork.on('error', (err: any) => reject([err]));
    childFork.on('disconnect', (err: any) => reject([err]));
  });
}
