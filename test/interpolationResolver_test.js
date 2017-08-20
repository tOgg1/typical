/* global describe, it */
let expect = require('chai').expect
let interpolationResolver = require('../src/interpolationResolver')

describe('interpolationResolver', () => {
  describe('#interpolateString', () => {
    it('should interpolate a string value', () => {
      const string = 'var $${myVarName} = 3;'
      const interpolations = {
        myVarName: 'newVariableName'
      }
      const result = interpolationResolver.interpolateString(string, interpolations)
      expect(result).to.equal('var newVariableName = 3;')
    })
    it('should not interpolate an eligible value which is not marked for interpolation', () => {
      const string = 'What is up $${myman}'
      const interpolations = {
        'notmyman': 'epic'
      }
      const result = interpolationResolver.interpolateString(string, interpolations)
      expect(result).to.equal(string)
    })
    it('should interpolate multiple values', () => {
      const string = 'for ($${iteratorOne} = $${val1}, $${iteratorTwo} = $${val2}; $${iteratorOne} < $${iteratorTwo}; ++$${iteratorOne})'
      const interpolations = {
        iteratorOne: 'i',
        iteratorTwo: 'j',
        val1: '1',
        val2: '500'
      }
      const result = interpolationResolver.interpolateString(string, interpolations)
      expect(result).to.equal('for (i = 1, j = 500; i < j; ++i)')
    })
    it('will interpolate an interpolation that spat out a new variable', () => {
      const string = 'Lets interpolate $${this}'
      const interpolations = {
        this: '$${that}',
        that: 'nothing'
      }
      const result = interpolationResolver.interpolateString(string, interpolations)
      expect(result).to.equal('Lets interpolate nothing')
    })
  })
  describe('#interpolateRegularConfig', () => {
    it('should interpolate all entries in a flat config', () => {
      const config = {
        file1: 'This content has some $${interpolated} content',
        file2: 'This content does not',
        file3: 'This has $${two} cases of interpolated $${content}'
      }
      const interpolations = {
        interpolated: 'regular',
        two: 'no',
        content: 'epicness'
      }
      const result = interpolationResolver.interpolateRegularConfig(config, interpolations)
      expect(result).to.deep.equal({
        file1: 'This content has some regular content',
        file2: 'This content does not',
        file3: 'This has no cases of interpolated epicness'
      })
    })
    it('should ignore a __meta__ and a __interpolations__ entry', () => {
      const config = {
        file: 'This $${should} not be ignored',
        __interpolations__: [
          'This should be ignored and stripped away'
        ]
      }
      const interpolations = {
        should: 'better'
      }
      const result = interpolationResolver.interpolateRegularConfig(config, interpolations)
      expect(result).to.deep.equal({
        file: 'This better not be ignored'
      })
    })
  })
})
