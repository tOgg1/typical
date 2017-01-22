#! /usr/bin/env node
let program = require('commander')
let configResolver = require('./src/configResolver')
let configWriter = require('./src/configWriter')

let configElement = '_default'

// Set up and parse program arguments.
// We only really care about the first positional argument
// giving use the correct config to use
program
  .arguments('[configElement]')
  .action(_configElement => {
    configElement = _configElement
  })
  .parse(process.argv)

// Merge regular config file and folder config
let config = Object.assign(
  {},
  configResolver.resolve(),
  configResolver.resolveFolderConfig()
)

// Lets go.
if (!config[configElement]) {
  throw Error('Found no element ' + configElement + ' in config')
}
configWriter.write(config[configElement])

