const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const interpolationResolver = require('./interpolationResolver')
const readdirp = require('readdirp')
const { containsIgnoredPattern } = require('./util')
const hooks = require('./hooks')

function writeFile (_filePath, _content) {
  const shouldWrite = hooks.emit(
    hooks.types.beforeFileWrite,
    {_filePath, _content}
  )

  if (!shouldWrite && shouldWrite !== undefined) {
    return
  }

  const { filePath, content } = hooks.emit(
    hooks.types.fileEmitContents,
    {filePath: _filePath, content: _content}
  ) || {filePath: _filePath, content: _content}
  fs.writeFileSync(filePath, content, 'utf8')
  hooks.emit(
    hooks.types.afterFileWrite,
    {filePath, content}
  )
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
      const shouldWrite = hooks.emit(
        hooks.types.beforeDirectoryWrite,
        {directoryPath: parentDirectory}
      )
      if (!shouldWrite) {
        return
      }
      fs.mkdirSync(directoryPath)
      hooks.emit(
        hooks.types.afterDirectoryWrite,
        {directoryPath: directoryPath}
      )
      writeDirectory(directoryPath, fileObject)
    }
  })
}

function writeFolderConfig (config, callback) {
  let promptFunction = interpolationResolver.resolveFolderConfig
  if (config.__disableInterpolations__) {
    promptFunction = (_, callback) => callback({})
  }
  promptFunction(config, function (userResolvedInterpolations) {
    readdirp({root: config.path, entryType: 'all'},
      entry => {
        // We avoid using fullPath here, as a users folder structure apart from
        // what's inside the config is not our concern
        if (containsIgnoredPattern(entry.path)) {
          return
        }

        if (entry.stat.isDirectory()) {
          const shouldWrite = hooks.emit(
            hooks.types.beforeDirectoryWrite,
            {directoryPath: entry.path}
          )
          if (!shouldWrite) {
            return
          }
          const directoryPath = path.join(
            config.__cwd__,
            interpolationResolver.interpolateString(entry.path, userResolvedInterpolations)
          )
          if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath)
          }
        } else {
          const parentDirectoryPath = path.join(
            config.__cwd__,
            interpolationResolver.interpolateString(entry.parentDir, userResolvedInterpolations)
          )
          // This happens if we have ignored creation of the folder from before.
          // Typically this happens through a hook. We should thus not attempt
          // to write the file
          if (!fs.existsSync(parentDirectoryPath)) {
            return
          }

          // Filenames may also contain interpolations
          const interpolatedPath = path.join(
            config.__cwd__,
            interpolationResolver.interpolateString(entry.path, userResolvedInterpolations)
          )
          const fileContents = interpolationResolver.interpolateString(
            fs.readFileSync(entry.fullPath, 'utf8'),
            userResolvedInterpolations
          )
          const shouldWrite = hooks.emit(
            hooks.types.beforeFileWrite,
            {filePath: interpolatedPath, content: fileContents}
          )
          if (!shouldWrite) {
            return
          }
          const { filePath, content } = hooks.emit(
            hooks.types.fileEmitContents,
            {filePath: interpolatedPath, content: fileContents}
          ) || {filePath: interpolatedPath, content: fileContents}
          writeFile(
            filePath,
            content
          )
          hooks.emit(
            hooks.types.afterFileWrite,
            {filePath: filePath, content: content}
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
  let promptFunction = interpolationResolver.resolveRegularConfig
  if (config.__disableInterpolations__) {
    promptFunction = (_, callback) => callback(config)
  }
  // Simply resolve all interpolations right away
  promptFunction(config, function (interpolatedConfig) {
    writeDirectory(config.__cwd__, interpolatedConfig)
    if (callback) {
      callback()
    }
  })
}

function write (config, callback) {
  config.__cwd__ = config.__cwd__ || cwd
  hooks.emit(hooks.types.beforeAll, config)
  // Create a wrapper callback emitting afterAll
  const newCallback = () => {
    hooks.emit(hooks.types.afterAll, config)
    if (callback) {
      callback()
    }
  }
  if (config.__isDirectory__) {
    writeFolderConfig(config, newCallback)
  } else {
    writeRegularConfig(config, newCallback)
  }
}

module.exports = {
  write: write
}
