const ignoredPatterns = [
  /__meta__/,
  /__interpolations__/,
  /__hooks__/,
  /__isDirectory__/,
  /__cwd__/,
  /__resolvedInterpolations__/,
  /__disableInterpolations__/
]

function containsIgnoredPattern (string) {
  for (var i = 0; i < ignoredPatterns.length; i++) {
    if (string.match(ignoredPatterns[i])) {
      return true
    }
  }
  return false
}

// Taken from https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

const interpolationRegex = /\$\$\{([a-zA-Z0-9|]+)\}/g

module.exports = {
  escapeRegExp: escapeRegExp,
  ignoredPatterns: ignoredPatterns,
  containsIgnoredPattern: containsIgnoredPattern,
  interpolationRegex: interpolationRegex
}
