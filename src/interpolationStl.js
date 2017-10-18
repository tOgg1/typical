const crypto = require('crypto')
const base64url = require('base64url')
const sha1 = crypto.createHash('sha1')
const sha256 = crypto.createHash('sha256')
const identity = x => x

const interpolationStandardLibrary = {
  identity,
  sha1: string => {
    sha1.update(string)
    return sha1.digest('hex')
  },
  sha256: string => {
    sha256.update(string)
    return sha256.digest('hex')
  },
  upperFirst: string => string.slice(0, 1).toUpperCase() + string.slice(1),
  upper: string => string.toUpperCase(),
  lower: string => string.toLowerCase(),
  random: () => crypto.randomBytes(32).toString('base64'),
  randomHex: () => crypto.randomBytes(32).toString('hex'),
  randomUrlSafe: () => base64url(crypto.randomBytes(32))
}

function get (name) {
  return interpolationStandardLibrary[name] || identity
}

function set (name, func) {
  interpolationStandardLibrary[name] = func
}

function has (name) {
  return Object.keys(interpolationStandardLibrary).includes(name)
}

function includes (func) {
  return Object.values(interpolationStandardLibrary).includes(func)
}

module.exports = {
  get,
  set,
  has,
  includes
}
