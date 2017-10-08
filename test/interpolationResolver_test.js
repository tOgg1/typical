/* global describe, it, before, after */
const expect = require('chai').expect
const mockfs = require('mock-fs')
const interpolationResolver = require('../src/interpolationResolver')

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
    it('should simply remove interpolation format from an eligible value which is not marked for interpolation', () => {
      const string = 'What is up $${myman}'
      const interpolations = {
        'notmyman': 'epic'
      }
      const result = interpolationResolver.interpolateString(string, interpolations)
      expect(result).to.equal('What is up myman')
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
    it('will not interpolate an interpolation that spat out a new variable', () => {
      const string = 'Lets interpolate $${this}'
      const interpolations = {
        this: '$${that}',
        that: 'nothing'
      }
      const result = interpolationResolver.interpolateString(string, interpolations)
      expect(result).to.equal('Lets interpolate $${that}')
    })
    it('should return the string on no interpolations', () => {
      const string = 'Just return this'
      const newString = interpolationResolver.interpolateString(string, [])
      expect(newString).to.equal(string)
    })
    it('should handle an interpolation with a method', () => {
      const string = 'Lets interpolate $${this|identity}'
      const interpolations = {
        this: 'that'
      }
      const newString = interpolationResolver.interpolateString(string, interpolations)
      expect(newString).to.equal('Lets interpolate that')
    })
    it('should handle an interpolation with a method that alters something', () => {
      const string = 'Lets interpolate $${this} and $${this|upper}'
      const interpolations = {
        this: 'that'
      }
      const newString = interpolationResolver.interpolateString(string, interpolations)
      expect(newString).to.equal('Lets interpolate that and THAT')
    })
    it('should handle the random stl', () => {
      const string = 'Lets generate something random $${|random}'
      const newString = interpolationResolver.interpolateString(string, {})
      expect(newString).to.include('Lets generate something random')
      expect(newString.length).to.be.above(string.length)
    })
    it('should handle the sha1 stl', () => {
      const string = 'Lets generate a sha1: $${niris|sha1}'
      const newString = interpolationResolver.interpolateString(string, {})
      expect(newString).to.equal('Lets generate a sha1: 62553f72063865f1283786259d4f2ce76adbc02e')
      expect(newString.length).to.be.above(string.length)
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
    it('should interpolate a file name', () => {
      const config = {
        '$${moduleName}': 'contents'
      }
      const interpolations = {
        moduleName: 'typical'
      }
      const result = interpolationResolver.interpolateRegularConfig(config, interpolations)
      expect(result).to.deep.equal({
        typical: 'contents'
      })
    })
    it('should interpolate a folder name', () => {
      const config = {
        '$${moduleName}': {
          file1: 'contents'
        }
      }
      const interpolations = {
        moduleName: 'typical'
      }
      const result = interpolationResolver.interpolateRegularConfig(config, interpolations)
      expect(result).to.deep.equal({
        typical: {
          file1: 'contents'
        }
      })
    })
    it('should interpolate multiple entries in a name', () => {
      const config = {
        '$${moduleName}_$${subName}': {
          file1: 'contents'
        }
      }
      const interpolations = {
        moduleName: 'typical',
        subName: 'testing'
      }
      const result = interpolationResolver.interpolateRegularConfig(config, interpolations)
      expect(result).to.deep.equal({
        typical_testing: {
          file1: 'contents'
        }
      })
    })
    it('should interpolate nested folders and files with content', () => {
      const config = {
        '$${moduleName}': {
          '$${subName}': {
            '$${fileName}': '$${contents}'
          }
        }
      }
      const interpolations = {
        moduleName: 'typical',
        subName: 'tests',
        fileName: 'meta_test.js',
        contents: 'throw 0'
      }
      const result = interpolationResolver.interpolateRegularConfig(config, interpolations)
      expect(result).to.deep.equal({
        typical: {
          tests: {
            'meta_test.js': 'throw 0'
          }
        }
      })
    })
  })
  describe('#scanRegularConfig', () => {
    it('should scan a simple element', () => {
      const config = {
        file: '$${This} should be parsed',
        file2: 'Nothing to see here'
      }
      expect(interpolationResolver.scanRegularConfig(config)).to.deep.equal([
        'This'
      ])
    })
    it('should scan multiple entries on one line', () => {
      const config = {
        file: '$${This} should be $${parsed}'
      }
      expect(interpolationResolver.scanRegularConfig(config)).to.deep.equal([
        'This', 'parsed'
      ])
    })
    it('should handle nested elements', () => {
      const config = {
        dir: {
          file: '$${This} should be parsed',
          dir2: {
            file2: 'So $${should}\n\n\t$${this}'
          }
        }
      }
      expect(interpolationResolver.scanRegularConfig(config)).to.deep.equal([
        'This', 'should', 'this'
      ])
    })
    it('should discover a filename element', () => {
      const config = {
        '$${Hello}': 'Lets see if we can find the filename'
      }
      expect(interpolationResolver.scanRegularConfig(config)).to.deep.equal([
        'Hello'
      ])
    })
  })
  describe('#scanDirectoryConfig', () => {
    before(() => {
      mockfs({
        '.typicalfolders': {
          path1: {
            file1: '$${This} should be parsed',
            file2: 'Nothing to see here'
          },
          path2: {
            file: '$${This} should be $${parsed}'
          },
          path3: {
            file: '$${This} should be parsed',
            dir2: {
              file2: 'So $${should}\n\n\t$${this}'
            }
          },
          path4: {
            '$${Hello}': 'Lets see if we can find the filename'
          },
          path5: {
            'file3': 'Lets see if it can handle a method $${fileName|upper}'
          }
        }
      })
    })
    after(() => {
      mockfs.restore()
    })
    it('should scan a simple element', done => {
      interpolationResolver.scanDirectoryConfig({path: '.typicalfolders/path1'}, result => {
        expect(result).to.deep.equal(['This'])
        done()
      })
    })
    it('should scan multiple entries on one line', (done) => {
      interpolationResolver.scanDirectoryConfig({path: '.typicalfolders/path2'}, result => {
        expect(result).to.deep.equal(['This', 'parsed'])
        done()
      })
    })
    it('should handle nested elements', (done) => {
      interpolationResolver.scanDirectoryConfig({path: '.typicalfolders/path3'}, result => {
        expect(result).to.deep.equal(['This', 'should', 'this'])
        done()
      })
    })
    it('should discover a filename element', (done) => {
      interpolationResolver.scanDirectoryConfig({path: '.typicalfolders/path4'}, result => {
        expect(result).to.deep.equal(['Hello'])
        done()
      })
    })
    it('should should handle a method', (done) => {
      interpolationResolver.scanDirectoryConfig({path: '.typicalfolders/path5'}, result => {
        expect(result).to.deep.equal(['fileName'])
        done()
      })
    })
  })
})
