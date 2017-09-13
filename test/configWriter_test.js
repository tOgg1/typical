/* global describe, it, before, after */
const cwd = process.cwd()
const mockfs = require('mock-fs')
const fs = require('fs')
const path = require('path')
const configWriter = require('../src/configWriter')
const expect = require('chai').expect

describe('configWriter', () => {
  before(() => {
    mockfs({
      '.typicalfolders': {
        path1: {
          file1: 'content1',
          subpath1: {
            subfile1: 'content2',
            subfile2: 'content3'
          }
        },
        path2: {
          sub: {
            sub: {
              path: {
                file: ''
              }
            }
          }
        },
        path3: {
          '$${moduleName}': 'contents'
        },
        path4: {
          '$${moduleName}': {
            file1: 'contents'
          }
        },
        path5: {
          '$${moduleName}_$${subName}': {
            file1: 'contents'
          }
        },
        path6: {
          '$${moduleName}': {
            '$${subName}': {
              '$${fileName}': '$${contents}'
            }
          }
        }
      }
    })
  })
  after(() => {
    mockfs.restore()
  })
  it('should write a regular config file', () => {
    const config = {
      'file1': '',
      'file2': '',
      'dir1': {
        'file3': ''
      }
    }

    configWriter.write(config)
    const expectedFile1 = path.resolve(cwd, 'file1')
    const expectedFile2 = path.resolve(cwd, 'file2')
    const expectedDirectory1 = path.resolve(cwd, 'dir1')
    const expectedSubfile1 = path.resolve(cwd, 'dir1/file3')

    expect(fs.existsSync(expectedFile1)).to.equal(true)
    expect(fs.existsSync(expectedFile2)).to.equal(true)
    expect(fs.existsSync(expectedDirectory1)).to.equal(true)
    expect(fs.existsSync(expectedSubfile1)).to.equal(true)
  })
  it('should write a config file with files being an Object instead of an array', () => {
    const config = {
      files: {file1: 'content1', file2: ''}
    }
    configWriter.write(config)
    const expectedFile1 = path.resolve(cwd, 'file1')
    const expectedFile2 = path.resolve(cwd, 'file2')
    expect(fs.existsSync(expectedFile1)).to.equal(true)
    expect(fs.existsSync(expectedFile2)).to.equal(true)
  })
  it('should write a folder config file', (done) => {
    // path1: {
    //   file1: 'content1',
    //   subpath1: {
    //     subfile1: 'content2',
    //     subfile2: 'content3'
    //   }
    // }
    const config = {
      path1: {
        path: '.typicalfolders/path1',
        isDirectory: true
      }
    }
    configWriter.write(config.path1, () => {
      const expectedFile1 = path.resolve(cwd, 'file1')
      const expectedFolder1 = path.resolve(cwd, 'subpath1')
      const expectedSubfile1 = path.resolve(cwd, 'subpath1/subfile1')
      const expectedSubfile2 = path.resolve(cwd, 'subpath1/subfile2')
      expect(fs.existsSync(expectedFile1)).to.equal(true)
      expect(fs.existsSync(expectedFolder1)).to.equal(true)
      expect(fs.existsSync(expectedSubfile1)).to.equal(true)
      expect(fs.existsSync(expectedSubfile2)).to.equal(true)
      done()
    })
  })
  it('should write a folder config file with greater depth', (done) => {
    // path2: {
    //   sub: {
    //     sub: {
    //       path: {
    //         file: ''
    //       }
    //     }
    //   }
    // }
    const config = {
      path2: {
        path: '.typicalfolders/path2',
        isDirectory: true
      }
    }
    configWriter.write(config.path2, () => {
      const expectedFile = path.resolve(cwd, 'sub/sub/path/file')

      expect(fs.existsSync(expectedFile)).to.equal(true)
      done()
    })
  })
})
