const fs = require('fs')
const ncp = require('ncp').ncp
const path = require('path')

function writeFile (path, content) {
  fs.writeFile(path, content, 'utf8', error => {
    if (error) {
      throw error
    }
  })
}

function writeFiles (parentDirectory, files) {
  if (!files) {
    return
  }
  if (files.constructor === Array) {
    files.forEach(file => writeFile(path.resolve(parentDirectory, file), ''))
  } else if (files.constructor === Object) {
    Object.keys(files).forEach(name => {
      writeFile(name, files[name])
    })
  }
}

function writeDirectory (parentDirectory, directoryObject) {
  writeFiles(parentDirectory, directoryObject.files)
  if (!directoryObject.directories) return
  Object.keys(directoryObject.directories).forEach(directory => {
    const newParentDirectory = parentDirectory + '/' + directory
    fs.mkdirSync(newParentDirectory)
    writeDirectory(newParentDirectory, directoryObject.directories[directory])
  })
}

function writeFolderConfig (config, callback) {
  const loadFromPath = config.path
  const folderFiles = fs.readdirSync(loadFromPath)
  let countdown = folderFiles.length
  const beforeCallback = _ => {
    if (--countdown === 0) {
      if (callback) {
        callback()
      }
    }
  }
  folderFiles.forEach(file => {
    ncp(path.resolve(loadFromPath, file), process.cwd(), error => {
      if (error) {
        throw error
      }
      beforeCallback()
    })
  })
}

function writeRegularConfig (config) {
  return writeDirectory(process.cwd(), config)
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
