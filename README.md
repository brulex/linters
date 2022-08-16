# Angular linters configuration
[![npm version](https://badge.fury.io/js/@brulex%2Flinters.svg)](https://badge.fury.io/js/@brulex%2Flinters)

This schematic allow to add to your environment linters for ts/js/html/css/sass/scss/json and other.
There are 3 main tools for linting in this schematic:
* [prettier](https://prettier.io/)
* [eslint](https://eslint.org/)
  * [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
* [stylelint](https://stylelint.io/)
  * [stylelint-scss](https://github.com/stylelint-scss/stylelint-scss)

## Installation and usage

To use this schematic you need to use Angular CLI directly(the package will be installed in this case)

```bash
ng add @brulex/linters
```

After running this command to your environment will be added:
* all needed packages for linters + `npm-run-all` to run all linters simultaneous
* config files for each linter: `.eslintrc.json`, `.prettierrc.json`, `.stylelintrc.json`
* scripts to run linting

To start lint you could run the following command:
```bash
npm run lint
```

## Compatibility with Angular
At the moment supported only **Angular 14**, in future will be considered adding support for this schematic to older versions
