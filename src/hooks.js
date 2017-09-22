const cwd = process.cwd()
const path = require('path')

const types = {
  beforeAll: 'before',
  configLoaded: 'configLoaded',
  recipeFound: 'recipeFound',
  beforeFileWrite: 'beforeFileWrite',
  fileEmitLine: 'fileEmitLine',
  afterFileWrite: 'afterFileWrite',
  beforeDirectoryWrite: 'beforeDirectoryWrite',
  afterDirectoryWrite: 'afterDirectoryWrite',
  afterAll: 'afterAll'
}

const listeners = {
  beforeAll: [],
  configLoaded: [],
  recipeFound: [],
  beforeFileWrite: [],
  fileEmitLine: [],
  afterFileWrite: [],
  beforeDirectoryWrite: [],
  afterDirectoryWrite: [],
  afterAll: []
}

function emit (hook) {
  if (!(hook in types)) {
    throw Error('Fatal error: Hook ' + hook.toString() + ' does not exist')
  }

  const hookListeners = listeners[hook] || []
  hookListeners.forEach(hookListener => hookListener(arguments.slice(1)))
}

function initialize (hookFiles) {
  if (hookFiles.constructor !== Array) {
    throw Error('Fatal error, hooks are not an array of string')
  }
  hookFiles.forEach(hook => {
    require(path.resolve(cwd, hook))
  })
}

function hook (hookName, hookFunction) {
  // toString for flexibility
  if (!(hookName.toString() in types)) {
    throw Error('Fatal error: Hookname ' + hook.toString() + ' does not exist')
  }
  listeners[hookName.toString()].push(hookFunction)
}

module.exports = {
  types: types,
  hook: hook,
  initialize: initialize,
  emit: emit
}
