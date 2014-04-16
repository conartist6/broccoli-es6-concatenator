var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var ES6Transpiler = require('es6-module-transpiler').Compiler
var jsStringEscape = require('js-string-escape')
var helpers = require('broccoli-kitchen-sink-helpers')
var Writer = require('broccoli-writer')

module.exports = ES6ModuleTranspiler

ES6ModuleTranspiler.prototype = Object.create(Writer.prototype)
ES6ModuleTranspiler.prototype.constructor = ES6ModuleTranspiler
function ES6ModuleTranspiler(inputTree, options) {
  if (!(this instanceof ES6ModuleTranspiler)) return new ES6ModuleTranspiler(inputTree, options)

  this.inputTree = inputTree

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }
}

ES6ModuleTranspiler.prototype.getWrapInEval = function () {
  // default to true for now
  return this.wrapInEval == null ? true : this.wrapInEval
}

ES6ModuleTranspiler.prototype.write = function (readTree, destDir) {
  var self = this

  return readTree(this.inputTree).then(function (srcDir) {
    // This glob tends to be the biggest performance hog
    var inputFiles = helpers.multiGlob(self.inputFiles, {cwd: srcDir})
    for (var i = 0; i < inputFiles.length; i++) {
      var inputFile = inputFiles[i]
      if (inputFile.slice(-3) !== '.js') {
        throw new Error('ES6 file does not end in .js: ' + inputFile)
      }
      var moduleName = inputFile.slice(0, -3)
      var compiledModule = addModule(moduleName)
      
      mkdirp.sync(path.join(destDir, path.dirname(inputFile)))
      fs.writeFileSync(path.join(destDir, inputFile), compiledModule)
    }

    function addModule (moduleName) {
      if (self.ignoredModules && self.ignoredModules.indexOf(moduleName) !== -1) return
      var i
      var modulePath = moduleName + '.js'
      var fullPath = srcDir + '/' + modulePath
      try {
        var fileContents = fs.readFileSync(fullPath).toString()
        var compiler = new ES6Transpiler(fileContents, moduleName)
        var compiledModule = compiler.toAMD()
        if (self.getWrapInEval()) {
          compiledModule = wrapInEval(compiledModule, modulePath)
        }

        return compiledModule
      } catch (err) {
        // Bug: When a non-existent file is referenced, this is the referenced
        // file, not the parent
        err.file = modulePath
        throw err
      }
    }
  })
}

function wrapInEval (fileContents, fileName) {
  // Should pull out copyright comment headers
  // Eventually we want source maps instead of sourceURL
  return 'eval("' +
    jsStringEscape(fileContents) +
    '//# sourceURL=' + jsStringEscape(fileName) +
    '");\n'
}
