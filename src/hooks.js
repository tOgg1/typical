const cwd = process.cwd()
const path = require('path')
const readdirp = require('readdirp')
const requireFromString = require('require-from-string')
const fs = require('fs')

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
  return hookListeners.reduce((acc, nextHook) => {
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

function initializeFromStrings (hookStrings) {
  if (hookStrings.constructor !== Array) {
    throw Error('Fatal error, hooks are not an array of string')
  }

  hookStrings.forEach(hookString => {
    requireFromString(hookString)
  })
}

function initializeFromDefaultHooksDirectory (configElement, callback) {
  if (configElement.__isDirectory__) {
    const hooksPath = path.resolve(configElement.path, '__hooks__')
    if (fs.existsSync(hooksPath)) {
      const files = []
      readdirp({root: hooksPath},
        file => files.push(file.fullPath),
        err => {
          if (err) {
            throw err
          }
          initialize(
            files.sort((x, y) => x.path === y.path ? 0 : x.path > y.path ? 1 : -1)
          )
          callback()
        }
      )
    }
  } else {
    const hooks = configElement.__hooks__
    if (hooks === undefined || hooks === null) {
      return
    }
    const queue = []
    const files = []
    queue.push(hooks)

    while (queue.length > 0) {
      const next = queue.shift()
      if (next.constructor === Object) {
        Object.keys(next).forEach(key => {
          const element = next[key]
          if (element.constructor === String) {
            files.push([key, next[key]])
          } else {
            queue.push(next[key])
          }
        })
      } else if (next.constructor === Array) {
        next.forEach(val => queue.push(val))
      } else if (next.constructor === String) {
        files.push(['', next])
      }
    }

    initializeFromStrings(
      files
        .sort((x, y) => x[0] === y[0] ? 0 : x[0] > y[0] ? 1 : -1)
        .map(x => x[1])
    )
    callback()
  }
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
  initializeFromStrings: initializeFromStrings,
  initializeFromDefaultHooksDirectory,
  emit: emit
}
