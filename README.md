# broccoli-es6-module-transpiler

Transpile ES6 modules to AMD modules.

## Installation

```bash
npm install --save-dev broccoli-es6-module-transpiler
```

## Usage

Note: The API will change in subsequent 0.x versions.

```js
var compileES6 = require('broccoli-es6-module-transpiler');
var applicationJs = compileES6(sourceTree, {
  ignoredModules: [
    'resolver'
  ],
  wrapInEval: true
});
```

### Options

* `.wrapInEval` (boolean): Enable or disable wrapping each module in an `eval`
  call with a `//# sourceURL` comment. Defaults to false.
