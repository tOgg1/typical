const hooks = require('./hooks')

module.exports = {
  configResolver: require('./configResolver'),
  configWriter: require('./configWriter'),
  interpolationResolver: require('./interpolationResolver'),
  hooks: hooks,
  hook: hooks.hook
}
