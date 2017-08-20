const util = require('./util')
const escapeRegExp = util.escapeRegExp
const prompt = require('prompt')

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

function resolveRegularConfig (config, interpolations) {
  return Object.keys(config).reduce((acc, filename) => {
    const fileObject = config[filename]
    if (typeof fileObject === 'string') {
      acc[filename] = interpolateString(fileObject, interpolations)
    } else if (fileObject.constructor === Object) {
      acc[filename] = resolveRegularConfig(fileObject, interpolations)
    }
    return acc
  }, {})
}

function resolve (configElement, callback) {
  let interpolations = configElement.__interpolations__
  if (!interpolations || interpolations.constructor !== Array || interpolations.length === 0) {
    return configElement
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

    callback(resolveRegularConfig(configElement, interpolations))
  })
}

module.exports = {
  resolve: resolve,
  interpolateString: interpolateString,
  resolveRegularConfig: resolveRegularConfig
}
