const hooks = require('./hooks')

module.exports = {
  configResolver: require('./configResolver'),
  configWriter: require('./configWriter'),
  interpolationResolver: require('./interpolationResolver'),
  interpolationStl: require('./interpolationsStl'),
  hooks: hooks,
  hook: hooks.hook
}
