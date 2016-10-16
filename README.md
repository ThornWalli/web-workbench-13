# Boilerplate
[![NPM version](https://badge.fury.io/gh/StephanGerbeth%2Fagency-boilerplate.svg)](https://badge.fury.io/gh/StephanGerbeth%2Fagency-boilerplate)
[![Build Status](https://img.shields.io/travis/StephanGerbeth/agency-boilerplate.svg?style=flat&label=Linux%20build)](https://travis-ci.org/StephanGerbeth/agency-boilerplate)
[![Windows Build status](https://img.shields.io/appveyor/ci/StephanGerbeth/agency-boilerplate.svg?style=flat&label=Windows%20build)](https://ci.appveyor.com/project/StephanGerbeth/agency-boilerplate)
[![Dependency Status](https://img.shields.io/david/StephanGerbeth/agency-boilerplate.svg?style=flat)](https://david-dm.org/StephanGerbeth/agency-boilerplate)
[![devDependency Status](https://img.shields.io/david/dev/StephanGerbeth/agency-boilerplate.svg?style=flat)](https://david-dm.org/StephanGerbeth/agency-boilerplate#info=devDependencies)

This boilerplate structure including tasks and servers should help you to develop modular websites + documentation per partial.

## Recommended IDE
Please use [Atom.io](https://atom.io/) to develop your project.
I tested some other IDEs (IntelliJ, Netbeans, Eclipse, Sublime, ...) but no one offers working support for handlebars and postcss.

### Recommended atom.io packages

Following atom.io-packages are recommended to use:

- [atom-handlebars](https://atom.io/packages/atom-handlebars)
- [editorconfig](https://atom.io/packages/editorconfig)
- [jshint](https://atom.io/packages/jshint)
- [language-postcss](https://atom.io/packages/language-postcss)
- [file-icons](https://atom.io/packages/file-icons)
- [todo-show](https://atom.io/packages/todo-show)
- [highlight-selected](https://atom.io/packages/highlight-selected)
- [pigments](https://atom.io/packages/pigments)
- [minimap](https://atom.io/packages/minimap)

## Boilerplate specs

The boilerplate based on [gulp](https://github.com/gulpjs/gulp) and [assemble (beta-5)](https://github.com/assemble/assemble).

### Implemented tasks

Those tasks are configured by default:

- clean
- copy
- handlebars-compiler
- postcss-compiler
- purecss-generator
- sitemap-generator
- watch-handler
- webpack-bundler

They could be modified by [env/tasks.json](./env/tasks.json).

### Implemented servers

Those servers are configured by default:

- hapijs
- hapijs-webpack-dev-server
- livereload
- weinre

They could be modified by [env/local.json](./env/local.json).

## Setup your environment

At first install the latest stable [node.js](https://nodejs.org/en/) version (>=5.1.0) by homebrew.

```
brew install node
```

When nodejs is installed you can run

```
npm install
```
The installation process should run without some errors.

### Test the environment
To verify a working environment just run the following command in the root folder of your project.

```
npm test
```

It should build all sources into the 'build'-directory of your project root folder. No error message should be shown in your console.

## Run development-environment

```
npm run dev
```

## Run production-environment

```
npm run prod
```

## Deployment to heroku


## Configuration

### Modernizr
modernizr-build can be customized by `.modernizrrc` inside the root directory of your project. [Here](https://github.com/Modernizr/Modernizr/blob/master/lib/config-all.json) you will find all available configuration options.

### jshint

ToDo:
- [x] Check CSSNano - doesn't remove comments  
- [x] Doc Helper
- [x] Related Links to included partials
- [x] Sample Controller/Model/Target, Handlebars, CSS
- [ ] Share atom.io configuration
- [ ] implement working Weinre

install node and npm on osx by homebrew
https://gist.github.com/DanHerbert/9520689

fixing network problem
short version (cmd): npm config set registry http://registry.npmjs.org/
long version: https://github.com/npm/npm/issues/7945

## heroku
---------
to install dev dependencies
heroku config:set NPM_CONFIG_PRODUCTION=false

test123456789

## Packages

Available packages:

- agency-pkg-base
- agency-pkg-common
- agency-pkg-elements
- agency-pkg-embed
- agency-pkg-layouts
- agency-pkg-polyfills
- agency-pkg-services
- agency-pkg-utils
