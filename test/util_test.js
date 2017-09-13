/* global describe, it */
const expect = require('chai').expect
const {
  containsIgnoredPattern
} = require('../src/util')

describe('#containsIgnoredPattern', () => {
  it('should ignore __meta__ and __interpolations__', () => {
    expect(containsIgnoredPattern('__interpolations__')).to.equal(true)
    expect(containsIgnoredPattern('__meta__')).to.equal(true)
  })
  it('should ignore the __isDirectory__ flag', () => {
    expect(containsIgnoredPattern('__isDirectory__')).to.equal(true)
  })
  it('should ignore the __hooks__ flag', () => {
    expect(containsIgnoredPattern('__hooks__')).to.equal(true)
  })
  it('should not ignore strings not containing a flag', () => {
    expect(containsIgnoredPattern('meta__')).to.equal(false)
    expect(containsIgnoredPattern('__meta')).to.equal(false)
    expect(containsIgnoredPattern('Some random line')).to.equal(false)
    expect(containsIgnoredPattern('$${hello}')).to.equal(false)
  })
  it('should ignore path string containing an ignored pattern', () => {
    expect(containsIgnoredPattern('/var/run/python/current/__interpolations__')).to.equal(true)
  })
})
