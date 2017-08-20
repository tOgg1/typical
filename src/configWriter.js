const fs = require('fs')
const readline = require('readline')
const ncp = require('ncp').ncp
const path = require('path')
const cwd = process.cwd()
const interpolationResolver = require('./interpolationResolver')

function writeFile (path, content) {
  fs.writeFile(path, content, 'utf8', error => {
    if (error) {
      throw error
    }
  })
}

function writeDirectory (parentDirectory, directoryObject) {
  Object.keys(directoryObject).forEach(fileName => {
    const fileObject = directoryObject[fileName]
    if (typeof fileObject === 'string') {
      writeFile(path.resolve(parentDirectory, fileName), fileObject)
    } else if (fileObject.constructor === Object) {
      const directoryPath = path.resolve(parentDirectory, fileName)
      fs.mkdirSync(directoryPath)
      writeDirectory(directoryPath, fileObject)
    }
  })
}

function writeFolderConfig (config, callback) {
  const loadFromPath = config.path
  const options = {

  }

  const startWriting = () => {
    ncp(loadFromPath, cwd, options, error => {
      if (error) {
        throw error
      }
      if (callback) {
        callback()
      }
    })
  }

  // If we've got interpolations, we create a transform function
  // utilizing readline to read every file line by line and transforming any line
  // matching an interpolation
  if (interpolationResolver.interpolationsAreValid(config.__interpolations__)) {
    interpolationResolver.promptForInterpolations(config.__interpolations__, function (userResolvedInterpolations) {
      options.transform = (read, write) => {
        const rl = readline.createInterface({
          input: read
        })

        rl.on('line', (input) => {
          write.write(interpolationResolver.interpolateString(input, userResolvedInterpolations) + '\n')
        })
      }
      startWriting()
    })
  } else {
    startWriting()
  }
}

function writeRegularConfig (config, callback) {
  // Simply resolve all interpolations right away
  interpolationResolver.resolveRegularConfig(config, function (interpolatedConfig) {
    writeDirectory(cwd, interpolatedConfig)
    if (callback) {
      callback()
    }
  })
}

function write (config, callback) {
  if (config.isDirectory) {
    writeFolderConfig(config, callback)
  } else {
    writeRegularConfig(config)
  }
}

module.exports = {
  write: write
}
