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
        }
      }
    })
  })
  after(() => {
    mockfs.restore()
  })
  it('should write a regular config file', () => {
    const config = {
      files: ['test1_file1.txt', 'test1_file2.txt'],
      directories: {
        test1_dir1: {
          files: ['test1_file3.txt']
        }
      }
    }

    configWriter.write(config)
    const expectedFile1 = path.resolve(cwd, 'test1_file1.txt');
    const expectedFile2 = path.resolve(cwd, 'test1_file2.txt');
    const expectedDirectory1 = path.resolve(cwd, 'test1_dir1');
    const expectedSubfile1 = path.resolve(cwd, 'test1_dir1/test1_file3.txt')

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
  });
  it('should write a folder config file', () => {
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
    })
  })
})
