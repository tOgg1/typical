/* global describe, afterEach, it */
let expect = require('chai').expect
let mockfs = require('mock-fs')
let configResolver = require('../src/configResolver')

let resolve = configResolver.resolve
let resolveFolderConfig = configResolver.resolveFolderConfig

describe('configResolver', () => {
  afterEach(() => {
    mockfs.restore()
  })
  it('should resolve a simple config', () => {
    mockfs({
      '.typicalrc': '{"_default": {"directories": [], "files": ["test1.txt", "test2.txt"]}}'
    })
    let config = resolve()
    expect(config).to.contain.all.keys('_default')
    expect(config._default).to.contain.all.keys('directories', 'files')
    expect(config._default.files).to.eql(['test1.txt', 'test2.txt'])
    mockfs.restore()
  })
  it('should resolve a simple folderconfig', () => {
    mockfs({
      '.typicalfolders': {
        'folder1': {
          'file1': 'content1',
          'file2': 'content2'
        },
        'folder2': {
          'file1': 'content1',
          'file3': 'content3'
        }
      }
    })
    let config = resolveFolderConfig()
    expect(config).to.contain.all.keys('folder1', 'folder2')
    expect(config.folder1).to.contain.all.keys('isDirectory', 'path')
    expect(config.folder1.path).to.contain('.typicalfolders/folder1')
    expect(config.folder2).to.contain.all.keys('isDirectory', 'path')
  })
  it('should merge a simple config with a simple folderconfig', () => {
    mockfs({
      '.typicalrc': '{"config1": {"directories": [], "files": ["test1.txt", "test2.txt"]}}',
      '.typicalfolders': {
        'config1': {
          'file1': 'content1',
          'file2': 'content2'
        },
        'config2': {
          'file1': 'content1',
          'file3': 'content3'
        }
      }
    })
    let config = Object.assign(
      {},
      resolve(),
      resolveFolderConfig()
    )
    expect(config).to.have.all.keys('config1', 'config2')
    expect(config.config1).to.have.all.keys('isDirectory', 'path')
    expect(config.config2).to.have.all.keys('isDirectory', 'path')
  })
})
