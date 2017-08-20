const ignoredPatterns = [
  '__meta__',
  '__interpolations__'
]

// Taken from https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

module.exports = {
  escapeRegExp: escapeRegExp,
  ignoredPatterns: ignoredPatterns
}
