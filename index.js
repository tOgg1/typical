#! /usr/bin/env node
let program = require('commander')
let configResolver = require('./src/configResolver')
let configWriter = require('./src/configWriter')
let interpolationResolver = require('./src/interpolationResolver')

let configElement = '_default'

// Set up and parse program arguments.
// We only really care about the first positional argument
// giving use the correct config to use
program
  .arguments('[configElement]')
  .action(_configElement => {
    configElement = _configElement
  })
  .option('-s, --scan', 'Automatically detect interpolatinos from content')
  .parse(process.argv)

// Merge regular config file and folder config
let config = Object.assign(
  {},
  configResolver.resolve(),
  configResolver.resolveFolderConfig()
)

// Does it exist?
if (!config[configElement]) {
  console.error('Found no recipe named \'' + configElement + '\' in resolved config')
  process.exit(1)
}

let resolvedElement = config[configElement]

if (program.scan) {
  interpolationResolver.scan(resolvedElement, (result) => {
    resolvedElement.__interpolations__ = (resolvedElement.__interpolations__ || []).concat(result)
    configWriter.write(resolvedElement)
  })
} else {
  configWriter.write(resolvedElement)
}

