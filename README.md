[![NPM version](https://img.shields.io/badge/npm-v0.3.0-blue.svg)](https://www.npmjs.com/package/typical.js)
[![Build Status](https://travis-ci.org/tOgg1/typical.svg?branch=develop)](https://travis-ci.org/tOgg1/typical)
# Typical

Typical is a simple CLI tool that enables you to quickly instantiate common directory structures. It also provides a systematic approach to storing your favourite boilerplates.

## Quick start
```
# global
npm install -g typical.js 

#local
npm install typical.js
```

## Basic usage
```
typical <configEntry>
```
Assuming that you have installed typical globally, you now have access to the command `typical`. Running the command will attempt to look for a [configuration file](#Basic_.typicalrc_configuration), or a [configuration directory](#.typicalfolders_configuration). 

If no arguments is supplied to `typical`, it will look for an entry called `_default`.

## Basic .typicalrc configuration

The .typicalrc file must be a JSON-file on the following format:
```
{
  "<configEntry>": {
    "<file>": String|Object
  }
}
```

If the value of a file-key is a string, a new regular file with the value as contents. If the value is an object,
a new directory will be created.

The most minimal working .typicalrc configuration file with both files and directories, would be along the lines of:
```json
{
  "entry": {
    "file": "File contents",
    "dir": {
      "file2: "File 2 contents"
    }
  }
}
```

With this configuration, running `typical entry` yields

```
.
├── dir
│   └── file2
└── file
```

## .typicalfolders configuration

## TODO

 * Support YAML-config
 * Variable interpolation in boilerplates
 * Support symbolic links in  .typicalrc files
