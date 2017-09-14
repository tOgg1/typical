const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const interpolationResolver = require('./interpolationResolver')
const readdirp = require('readdirp')
const { containsIgnoredPattern } = require('./util')

function writeFile (path, content) {
  fs.writeFileSync(path, content, 'utf8')
}

function writeDirectory (parentDirectory, directoryObject) {
  Object.keys(directoryObject).forEach(fileName => {
    if (containsIgnoredPattern(fileName)) {
      return
    }

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
  interpolationResolver.promptForInterpolations(config.__interpolations__, function (userResolvedInterpolations) {
    readdirp({root: config.path, entryType: 'all'},
      entry => {
        // Avoid using fullPath here, as a users folder structure apart from
        // what's inside the config is not our concern
        if (containsIgnoredPattern(entry.path)) {
          return
        }

        if (entry.stat.isDirectory()) {
          const directoryPath = path.join(
            cwd,
            interpolationResolver.interpolateString(entry.path, userResolvedInterpolations)
          )
          if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath)
          }
        } else {
          const fileContents = fs.readFileSync(entry.fullPath, 'utf8')
          const interpolatedPath = path.join(
            cwd,
            interpolationResolver.interpolateString(entry.path, userResolvedInterpolations)
          )
          writeFile(
            interpolatedPath,
            interpolationResolver.interpolateString(fileContents, userResolvedInterpolations)
          )
        }
      },
      err => {
        if (err) {
          throw err
        }
        if (callback) {
          callback()
        }
      }
    )
  })
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
    writeRegularConfig(config, callback)
  }
}

module.exports = {
  write: write
}
