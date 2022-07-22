import {
  Rule,
  SchematicsException,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  strings,
  url,
} from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { addDependency, DependencyType, ExistingBehavior } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';

import { LATEST_VERSIONS, CONFIGURE_LINTERS_PACKAGES } from '../utility/packages';
import { Schema as ConfigureLintersSchema } from './schema';

function addScriptsToPackageJson(): Rule {
  return host => {
    const pkgJson = new JSONFile(host, 'package.json');
    const scripts = {
      lint: 'run-p -c -l stylelint eslint prettier',
      'lint-fix': 'run-p -c -l stylelint-fix eslint-fix prettier-fix ',
      stylelint: 'stylelint "./src/**/*.scss"',
      'stylelint-fix': 'npm run stylelint -- --fix',
      eslint: 'eslint .',
      'eslint-fix': 'npm run eslint -- --fix',
      'prettier-base': 'prettier "{**/*,*}.{js,ts,html,scss,json}" --ignore-path .gitignore --loglevel=warn',
      prettier: 'npm run prettier-base -- --check',
      'prettier-fix': 'npm run prettier-base -- --write',
    };

    Object.entries(scripts).forEach(([scriptName, script]) => {
      const scriptPath = ['scripts', scriptName];
      if (!pkgJson.get(scriptPath)) {
        pkgJson.modify(scriptPath, script, false);
      }
    });
  };
}

export default function (options: ConfigureLintersSchema): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = workspace.projects.get(options.project as string);
    const baseTsConfigPath = 'tsconfig.json';

    if (!project) {
      throw new SchematicsException(`Project "${options.project}" does not exist.`);
    }

    const templateSource = apply(url('./files'), [
      applyTemplates({
        ...strings,
        prefix: project.prefix,
        baseTsConfigPath,
      }),
      move(project.root),
    ]);

    return chain([
      mergeWith(templateSource),
      ...CONFIGURE_LINTERS_PACKAGES.map(name =>
        addDependency(name, LATEST_VERSIONS[name], {
          type: DependencyType.Dev,
          existing: ExistingBehavior.Replace,
        }),
      ),
      addScriptsToPackageJson(),
    ]);
  };
}
