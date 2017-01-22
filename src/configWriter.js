const fs = require('fs')
const ncp = require('ncp').ncp
const path = require('path')
const cwd = process.cwd()

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
  ncp(loadFromPath, cwd, error => {
    if (error) {
      throw error
    }
    if (callback) {
      callback()
    }
  })
}

function writeRegularConfig (config) {
  return writeDirectory(cwd, config)
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
