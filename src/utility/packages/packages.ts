export const ANGULAR_ESLINT_PACKAGES = [
  '@angular-eslint/eslint-plugin',
  '@angular-eslint/eslint-plugin-template',
  '@angular-eslint/template-parser',
];

export const TYPESCRIPT_ESLINT_PACKAGES = ['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'];

export const ESLINT_PACKAGES = [
  'eslint',
  'eslint-config-prettier',
  'eslint-import-resolver-typescript',
  'eslint-plugin-import',
  'eslint-plugin-prettier',
  'eslint-plugin-rxjs',
  'eslint-plugin-simple-import-sort',
];

export const PRETTIER_PACKAGES = ['prettier', 'prettier-eslint', 'prettier-plugin-organize-attributes'];

export const STYLELINT_PACKAGES = [
  'stylelint',
  'stylelint-config-prettier',
  'stylelint-config-recommended-scss',
  'stylelint-config-standard',
  'stylelint-order',
  'stylelint-prettier',
  'stylelint-scss',
];

export const OTHER_PACKAGES = ['npm-run-all'];

export const CONFIGURE_LINTERS_PACKAGES = [
  ...ANGULAR_ESLINT_PACKAGES,
  ...TYPESCRIPT_ESLINT_PACKAGES,
  ...PRETTIER_PACKAGES,
  ...ESLINT_PACKAGES,
  ...STYLELINT_PACKAGES,
  ...OTHER_PACKAGES,
];
