const cwd = process.cwd()
const path = require('path')

const types = {
  beforeAll: 'beforeAll',
  configLoaded: 'configLoaded',
  recipeFound: 'recipeFound',
  beforeFileWrite: 'beforeFileWrite',
  fileEmitContents: 'fileEmitContents',
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
  fileEmitContents: [],
  afterFileWrite: [],
  beforeDirectoryWrite: [],
  afterDirectoryWrite: [],
  afterAll: []
}

function emit (hook, data) {
  if (!(hook in types)) {
    throw Error('Fatal error: Hook ' + hook.toString() + ' does not exist')
  }

  const hookListeners = listeners[hook] || []
  return hookListeners.reduce((nextHook, acc) => {
    const nextData = nextHook(acc, data)
    if (nextData === undefined) {
      return acc
    }
    return nextData
  }, data)
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
  if (!(typeof hookFunction === 'function')) {
    throw Error('Fatal error: Trying to register non-function hook to type ' + hookName)
  }
  listeners[hookName.toString()].push(hookFunction)
}

module.exports = {
  types: types,
  hook: hook,
  initialize: initialize,
  emit: emit
}
