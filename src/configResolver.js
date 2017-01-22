const findConfig = require('find-config')
const fs = require('fs')
const path = require('path')

function resolve () {
  let nearestConfig = findConfig.read('.typicalrc')
  if (!nearestConfig) {
    return {}
  }
  return JSON.parse(nearestConfig)
}

function resolveFolderConfig () {
  // This should be a folder, so we don't read it, but rather traverse it.
  let nearestConfig = findConfig('.typicalfolders')
  if (!nearestConfig) {
    return {}
  }
  let result = {}
  fs.readdirSync(nearestConfig).forEach(file => {
    const folderPath = path.resolve(nearestConfig, file)
    if (fs.statSync(folderPath).isDirectory()) {
      result[file] = {isDirectory: true, path: folderPath}
    }
  })
  return result
}

module.exports = {
  resolve: resolve,
  resolveFolderConfig: resolveFolderConfig
}
