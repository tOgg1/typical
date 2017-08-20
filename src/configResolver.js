const findConfig = require('find-config')
const userHome = require('user-home')
const fs = require('fs')
const path = require('path')
const userHomeTypicalRc = path.resolve(userHome, '.typicalrc')
const userHomeTypicalFolders = path.resolve(userHome, '.typicalfolders')

function loadConfigFile (filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function loadFolderConfig (dirPath) {
  if (!dirPath || !fs.existsSync(dirPath)) {
    return {}
  }
  let result = {}
  fs.readdirSync(dirPath).forEach(file => {
    const folderPath = path.resolve(dirPath, file)
    if (fs.statSync(folderPath).isDirectory()) {
      result[file] = {isDirectory: true, path: folderPath}
      // Read interpolations
      const interpolationsPath = path.resolve(folderPath, '__interpolations__')
      if (fs.existsSync(path.resolve(folderPath, '__interpolations__'))) {
        result[file].__interpolations__ = loadConfigFile(interpolationsPath)
      }
    }
  })
  return result
}

function resolve () {
  let nearestConfig = findConfig('.typicalrc')
  return Object.assign(
    {},
    loadConfigFile(userHomeTypicalRc),
    loadConfigFile(nearestConfig)
  )
}

function resolveFolderConfig () {
  // This should be a folder, so we don't read it, but rather traverse it.
  let nearestConfig = findConfig('.typicalfolders')

  return Object.assign(
    {},
    loadFolderConfig(userHomeTypicalFolders),
    loadFolderConfig(nearestConfig)
  )
}

module.exports = {
  resolve: resolve,
  resolveFolderConfig: resolveFolderConfig
}
