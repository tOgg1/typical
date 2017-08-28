const ignoredPatterns = [
  '__meta__',
  '__interpolations__'
]

// Taken from https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

const interpolationRegex = /\$\$\{([\w0-9]+)\}/g

module.exports = {
  escapeRegExp: escapeRegExp,
  ignoredPatterns: ignoredPatterns,
  interpolationRegex: interpolationRegex
}
