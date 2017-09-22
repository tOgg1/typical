#! /usr/bin/env node
const program = require('commander')
const colors = require('colors')
const configResolver = require('./src/configResolver')
const configWriter = require('./src/configWriter')
const interpolationResolver = require('./src/interpolationResolver')

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
  .option('-l, --list', 'List available typical recipes recipes')
  .option('-p, --print', 'Print the config selected config element to stdout')
  .option(
  .option(
    '-d, --disable-interpolation',
    'Disables all handling of interpolation. ' +
    'If -s/--scan is enabled simultaneously, it will be ignored')
  .parse(process.argv)

// Merge regular config file and folder config
let config = Object.assign(
  {},
  configResolver.resolve(),
  configResolver.resolveFolderConfig()
)

// If list is true, we simply list the available recipes
if (program.list) {
  console.log(colors.green('Available typical recipes:'))
  Object.keys(config).forEach(element => {
    console.log(colors.gray(' + ' + element.toString()))
  })
  process.exit(0)
}

// Does it exist?
if (!config[configElement]) {
  console.error(colors.red('Found no recipe named \'' + configElement + '\' in resolved config'))
  process.exit(1)
}

let resolvedElement = config[configElement]

if (program.disableInterpolation) {
  resolvedElement.__disableInterpolations__ = true
}

// If print is true, we simply print the recipe, and exit
if (program.print) {
  console.log(colors.green('Typical recipe ') + '"' + colors.cyan(configElement) + '"')
  console.log(colors.gray(JSON.stringify(resolvedElement, null, 2)))
  process.exit(0)
}

if (!program.disableInterpolation && program.scan) {
  interpolationResolver.scan(resolvedElement, (result) => {
    resolvedElement.__interpolations__ = (resolvedElement.__interpolations__ || []).concat(result)
    configWriter.write(resolvedElement)
  })
} else {
  configWriter.write(resolvedElement)
}

