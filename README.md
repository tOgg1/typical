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
      "file2": "File 2 contents"
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

When typical is called, it will look for a .typicalrc folder as specified by [find-config](https://github.com/shannonmoeller/find-config). If a .typicalrc file exists at the home directory of the invocating user, this config file will be merged with the 'locally found' one. The locally found config will have precedence over the home directory config.

## .typicalfolders configuration

The second configuration option to typical, is to create a `.typicalfolders` folder somewhere in the path of your working directory.

The .typicalfolders folder is expected to contain a set of subdirectories (and no files). When loading config from a .typicalfolders folder, the names of these subdirectories will be the configElement-keys, and their contents will be the values of these.

For instance, if we have a directory-structure as follows:

```
.
└── .typicalfolders
    └── html-boilerplate
        ├── favicon.ico
        └── index.html
```

then invoking `typical html-boilerplate` would generate the two files `favicon.ico` and `index.html` in the current working directory.

### Using .typicalfolders as a storage for your favourite boilerplates

By creating a .typicalfolders folder in e.g. your home directory, you can use it to store any boilerplate you would like, later to be invoked by the `typical` command.

Say for instance we want to have [this html5 boilerplate](https://github.com/h5bp/html5-boilerplate) at our disposition at all times. This can be accomplished by running:

```
cd ~ && mkdir .typicalfolders && cd .typicalfolders
git clone https://github.com/h5bp/html5-boilerplate
```
Now we can run `typical html5-boilerplate` at some empty directory to instantiate it with the html5-boilerplate directory.

Note that this will also copy any "hidden" file, such as the .git directory, which you might want to delete.

When typical is called, it will look for a .typicalfolders folder as specified by [find-config](https://github.com/shannonmoeller/find-config). If a .typicalfolders directory exists at the home directory of the invocating user, the resulting config will be merged with the 'locally found' config. The locally found config will have precedence over the home directory config.

## Interpolations

Typical supports variable interpolation. The interpolations follow the following format:

```
This is some text, and $${this} will be interpolated
```

Say you would like your favorite typical recipe to set up a package.json file as follows:

```json
{
  "name": "nameOfProject",
  "version": "0.0.4",
  "description": "descriptionOfProject",
  "scripts": {
    "test": "mocha test"
  }
}
```

Now you might want to be prompted for the name of the project, and perhaps the description, on every invocation of the recipe generating this file. To do that, the file would look as follows:


```json
{
  "name": "$${nameOfProject}",
  "version": "0.0.4",
  "description": "$${descriptionOfProject}",
  "scripts": {
    "test": "mocha test"
  }
}
```

For typical to then prompt you for input, you will have to create an entry in the config named __interpolations__, which contains a list of names to prompt the input for.

If we are using a .typicalrc file, we would simple add an __interpolations__ entry in the json structure. If we are using a .typicalfolders config, we would write a new __interpolations__ file containing the json array. For instance:

```
[
  'nameOfProject',
  'descriptionOfProject'
]
```

Typical uses [prompt](https://github.com/flatiron/prompt) for prompting for user input. The __interpolations__ entry may contain any type of more complex prompt config, for example:

```
[
  {
    "name": "nameOfProject",
    "description": "Name of the project",
    "default": "newProjcet"
  },
  {
    "name": "description",
    "description": "Write a short description"
  }
]
```

### Detection of variables

By default, only the variables defined in the __interpolations__ array will be prompted for, and then interpolated. However, if the command is run with the `--scan` flag, all files will be scanned for possible interpolations (i.e. parts of the file matching our interpolation format).

## TODO

 * Support YAML-config
 * Interpolation of file names
 * Support symbolic links in  .typicalrc files
