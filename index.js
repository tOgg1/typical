#! /usr/bin/env node
const packageConfig = require('./package.json')
const program = require('commander')
const colors = require('colors')
const configResolver = require('./src/configResolver')
const configWriter = require('./src/configWriter')
const interpolationResolver = require('./src/interpolationResolver')
const hooks = require('./src/hooks')
const path = require('path')

let configElement = '_default'

function handleHook (element, acc) {
  acc.push(element)
  return acc
}

function handleInterpolation (element, acc) {
  acc.push(element)
  return acc
}

// Set up and parse program arguments.
// We only really care about the first positional argument
// giving use the correct config to use
program
  .version(packageConfig.version)
  .arguments('[configElement]')
  .action(_configElement => {
    configElement = _configElement
  })
  .option('-s, --scan', 'Automatically detect interpolatinos from content')
  .option('-S, --scan-list', 'Automatically detect interpolatinos from content, and print them to stdout.')
  .option('-I, --print-interpolations', 'Print interpolations for recipe')
  .option('-l, --list', 'List available typical recipes recipes')
  .option('-p, --print', 'Print the config selected config element to stdout')
  .option(
    '-o, --output-directory <output>',
    'The output directory to write files to. Defaults to the current working directory.'
  )
  .option(
    '-h, --hook <input>',
    'One or more files with hooks.',
    handleHook,
    []
  )
  .option(
    '-i, --interpolation <input>',
    'Preresolves the value of an interpolation. Expects a key=value pair input.',
    handleInterpolation,
    []
  )
  .option(
    '-d, --disable-interpolation',
    'Disables all handling of interpolations. ' +
    'If -s/--scan is enabled simultaneously, it will be ignored'
  )
  .parse(process.argv)

const cwd = path.resolve(process.cwd(), program.outputDirectory || '.')

// Merge regular config file and folder config
let config = Object.assign(
  {},
  configResolver.resolve(cwd),
  configResolver.resolveFolderConfig(cwd)
)

// We have hooks to initialize
if (program.hook) {
  hooks.initialize(program.hook)
}

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
hooks.initializeFromDefaultHooksDirectory(resolvedElement, () => {
  hooks.emit(hooks.types.recipeFound, resolvedElement)

  if (program.disableInterpolation) {
    resolvedElement.__disableInterpolations__ = true
  }

  resolvedElement.__cwd__ = cwd

  // If print is true, we simply print the recipe, and exit
  if (program.print) {
    console.log(colors.gray(JSON.stringify(resolvedElement, null, 2)))
    process.exit(0)
  }

  // If printInterpolations is true, we print the interpolations config of the recipe
  if (program.printInterpolations) {
    console.log(colors.gray(JSON.stringify(resolvedElement.__interpolations__, null, 2)))
    process.exit(0)
  }

  // If we scanList is true, we scan and then print.
  if (program.scanList) {
    interpolationResolver.scan(resolvedElement, result => {
      console.log(colors.gray(JSON.stringify(
        (resolvedElement.__interpolations__ || []).concat(result),
        null,
        2
      )))
    })
    process.exit(0)
  }

  // If we have preresolved interpolations we
  if (program.interpolation) {
    resolvedElement.__resolvedInterpolations__ = program.interpolation
      .reduce((acc, keyVal) => {
        const [key, val] = keyVal.split('=')
        acc[key] = val
        return acc
      }, {})
  }

  if (!program.disableInterpolation && program.scan) {
    interpolationResolver.scan(resolvedElement, (result) => {
      resolvedElement.__interpolations__ = (resolvedElement.__interpolations__ || []).concat(result)
      configWriter.write(resolvedElement)
    })
  } else {
    configWriter.write(resolvedElement)
  }
})
