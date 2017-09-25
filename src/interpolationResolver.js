const util = require('./util')
const escapeRegExp = util.escapeRegExp
const interpolationRegex = util.interpolationRegex
const prompt = require('prompt')
const fs = require('fs')
const readdirp = require('readdirp')

prompt.message = ''
prompt.delimiter = ''

prompt.start()

function createInterpolationRegex (interpolationName) {
  return new RegExp(escapeRegExp('$${' + interpolationName + '}'), 'g')
}

function interpolateString (string, interpolations) {
  return Object.keys(interpolations).reduce(function (acc, interpolationKey) {
    let interpolationValue = interpolations[interpolationKey]
    return acc.replace(
      createInterpolationRegex(interpolationKey),
      // We replace with the interpolationValue in a function here, so we don't get
      // the free-of-charge trickiness with "$" characters. See
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
      // for more information.
      function () {
        return interpolationValue
      }
    )
  }, string)
}

function interpolateRegularConfig (config, interpolations) {
  return Object.keys(config).reduce((acc, filename) => {
    const fileObject = config[filename]
    const newFileName = interpolateString(filename, interpolations)
    if (typeof fileObject === 'string') {
      acc[newFileName] = interpolateString(fileObject, interpolations)
    } else if (fileObject.constructor === Object) {
      acc[newFileName] = interpolateRegularConfig(fileObject, interpolations)
    }
    return acc
  }, {})
}

function interpolationsAreValid (interpolations) {
  return !!interpolations && interpolations.constructor === Array && interpolations.length !== 0
}

function promptForInterpolations (interpolations, callback) {
  if (!interpolations || !interpolationsAreValid(interpolations)) {
    callback({})
    return
  }

  prompt.get(interpolations, function (err, result) {
    if (err) {
      throw Error('Unable to get input from prompt. Failed with error: ' + err)
    }

    interpolations = interpolations.reduce((acc, key) => {
      if (key.constructor === Object) {
        acc[key.name] = result[key.name]
      } else {
        acc[key] = result[key]
      }
      return acc
    }, {})

    callback(interpolations)
  })
}

function resolveRegularConfig (configElement, callback) {
  let interpolations = configElement.__interpolations__
  if (!interpolationsAreValid(interpolations)) {
    callback(configElement)
    return
  }

  let preresolvedInterpolations = Object.keys(configElement.__resolvedInterpolations__) || []
  interpolations = interpolations.filter(x =>
    preresolvedInterpolations.indexOf(x) === -1 &&
    preresolvedInterpolations.indexOf(x.name) === -1
  )

  promptForInterpolations(interpolations, (resolvedInterpolations) =>
    callback(
      interpolateRegularConfig(
        configElement,
        Object.assign(
          {},
          resolvedInterpolations,
          configElement.__resolvedInterpolations__ || {}
        )
      )
    )
  )
}

function resolveFolderConfig (configElement, callback) {
  let interpolations = configElement.__interpolations__
  if (!interpolationsAreValid(interpolations)) {
    callback([])
    return
  }

  let preresolvedInterpolations = Object.keys(configElement.__resolvedInterpolations__) || []
  interpolations = interpolations.filter(x =>
    preresolvedInterpolations.indexOf(x) === -1 &&
    preresolvedInterpolations.indexOf(x.name) === -1
  )

  promptForInterpolations(
    interpolations,
    resolvedInterpolations =>
      callback(
        Object.assign(
          {},
          resolvedInterpolations,
          configElement.__resolvedInterpolations__ || {}
        )
    )
  )
}

function scanRegularConfig (configElement, callback) {
  const result = Object.keys(configElement).reduce((acc, filename) => {
    // Get any interpolations in filename
    let match
    while ((match = interpolationRegex.exec(filename))) {
      acc.push(match[1])
    }

    const fileObject = configElement[filename]
    if (typeof fileObject === 'string') {
      while ((match = interpolationRegex.exec(fileObject))) {
        acc.push(match[1])
      }
    } else {
      acc = acc.concat(scanRegularConfig(fileObject))
    }
    return acc
  }, [])
  if (callback) {
    callback(result)
  }
  return result
}

function scanDirectoryConfig (configElement, callback) {
  const results = []
  readdirp({root: configElement.path, entryType: 'all'},
    entry => {
      // Get any interpolations in filename
      let match
      while ((match = interpolationRegex.exec(entry.path))) {
        results.push(match[1])
      }

      if (entry.stat.isDirectory()) {
        return
      }
      const fileContents = fs.readFileSync(entry.fullPath, 'utf8')
      while ((match = interpolationRegex.exec(fileContents))) {
        results.push(match[1])
      }
    },
    err => {
      if (err) throw err
      callback(results)
    }
  )
}

function scan (configElement, callback) {
  if (configElement.__isDirectory__) {
    return scanDirectoryConfig(configElement, callback)
  } else {
    return scanRegularConfig(configElement, callback)
  }
}

module.exports = {
  interpolateString: interpolateString,
  interpolateRegularConfig: interpolateRegularConfig,
  interpolationsAreValid: interpolationsAreValid,
  promptForInterpolations: promptForInterpolations,
  resolveRegularConfig: resolveRegularConfig,
  resolveFolderConfig: resolveFolderConfig,
  scanRegularConfig: scanRegularConfig,
  scanDirectoryConfig: scanDirectoryConfig,
  scan: scan
}
