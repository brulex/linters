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
  MergeStrategy,
} from '@angular-devkit/schematics';
import { ProjectDefinition } from '@schematics/angular/utility/workspace';

import { addDependency, DependencyType, readWorkspace } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';

import { PACKAGES_WITH_LATEST_VERSIONS, CONFIGURE_LINTERS_PACKAGES, PACKAGE_JSON_SCRIPTS } from '../utility/packages';
import { ConfigureLintersSchema } from './schema';

const TEMPLATE_FILES_PATH = './files';
const BASE_TS_CONFIG_PATH = 'tsconfig.json';
const DEFAULT_PREFIX = 'app';
const PACKAGE_JSON_SCRIPTS_SECTION_NAME = 'scripts';
const PACKAGE_JSON_PATH = 'package.json';

function addScriptsToPackageJson(): Rule {
  return host => {
    const pkgJson = new JSONFile(host, PACKAGE_JSON_PATH);

    Object.entries(PACKAGE_JSON_SCRIPTS).forEach(([scriptName, script]) => {
      const scriptPath = [PACKAGE_JSON_SCRIPTS_SECTION_NAME, scriptName];
      if (!pkgJson.get(scriptPath)) {
        pkgJson.modify(scriptPath, script, false);
      }
    });
  };
}

function addPackages(): Rule {
  return chain(
    CONFIGURE_LINTERS_PACKAGES.map(name =>
      addDependency(name, PACKAGES_WITH_LATEST_VERSIONS[name], {
        type: DependencyType.Dev,
      }),
    ),
  );
}

export function getWorkspacePath(host: Tree) {
  const possibleFiles = ['/workspace.json', '/angular.json', '/.angular.json'];
  return possibleFiles.filter(path => host.exists(path))[0];
}

async function getProject(tree: Tree, options: ConfigureLintersSchema): Promise<ProjectDefinition> {
  const workspace = await readWorkspace(tree, getWorkspacePath(tree));
  const project = workspace.projects.get(options.project);

  if (!project) {
    throw new SchematicsException(`Project "${options.project}" does not exist.`);
  }

  return project;
}

async function addConfigFiles(host: Tree, options: ConfigureLintersSchema): Promise<Rule> {
  const project = await getProject(host, options);

  const templateSource = apply(url(TEMPLATE_FILES_PATH), [
    applyTemplates({
      ...strings,
      prefix: project.prefix || DEFAULT_PREFIX,
      baseTsConfigPath: BASE_TS_CONFIG_PATH,
    }),
    move(project.root),
  ]);

  return mergeWith(templateSource, MergeStrategy.Overwrite);
}

export default function (options: ConfigureLintersSchema): Rule {
  return async (host: Tree) => {
    return chain([await addConfigFiles(host, options), addPackages(), addScriptsToPackageJson()]);
  };
}
