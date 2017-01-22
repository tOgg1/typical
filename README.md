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
```json
{
  <configEntry>: {
    files: Array|Object,
    directories: Object
  }
}
```

The most minimal working .typicalrc configuration file with both files and directories, would be along the lines of:
```json
{
  "entry": {
    "files": ["file1"],
    "directories": {
      "dir1": {
        files: ["file2"]
      }
    }
  }
}
```

With this configuration, running `typical entry` yields

```
.
├── dir1
│   └── file2
└── file1
```


## .typicalfolders configuration

## TODO
