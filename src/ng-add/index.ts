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

import { addDependency, DependencyType } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';

import { LATEST_VERSIONS, CONFIGURE_LINTERS_PACKAGES, PACKAGE_JSON_SCRIPTS } from '../utility/packages';
import { ConfigureLintersSchema } from './schema';

function addScriptsToPackageJson(): Rule {
  return host => {
    const pkgJson = new JSONFile(host, 'package.json');

    Object.entries(PACKAGE_JSON_SCRIPTS).forEach(([scriptName, script]) => {
      const scriptPath = ['scripts', scriptName];
      if (!pkgJson.get(scriptPath)) {
        pkgJson.modify(scriptPath, script, false);
      }
    });
  };
}

function addPackages(): Rule {
  return () => {
    return chain(
      CONFIGURE_LINTERS_PACKAGES.map(name =>
        addDependency(name, LATEST_VERSIONS[name], {
          type: DependencyType.Dev,
        }),
      ),
    );
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

    return chain([mergeWith(templateSource), addPackages(), addScriptsToPackageJson()]);
  };
}
