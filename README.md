[![NPM version](https://img.shields.io/badge/npm-v0.4.2-blue.svg)](https://www.npmjs.com/package/typical.js)
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

For typical to then prompt you for input, you will have to create an entry in the config named `__interpolations__`, which contains a list of names to prompt the input for.

If we are using a .typicalrc file, we would simple add an `__interpolations__` entry in the json structure. If we are using a .typicalfolders config, we would write a new `__interpolations__` file containing the json array. For instance:

```
[
  'nameOfProject',
  'descriptionOfProject'
]
```

Typical uses [prompt](https://github.com/flatiron/prompt) for prompting for user input. The `__interpolations__` entry may contain any type of more complex prompt config, for example:

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

Typical will also interpolate file names an folder names. Thus a configuration as follows:

```
.
├── __interpolations__
├── $${myDir}
│   └── index.js
└── $${myFile}
```

Will with giving interpolations of `$${myDir}` and `$${myFile}` give the expected results.

### Detection of variables

By default, only the variables defined in the `__interpolations__` array will be prompted for, and then interpolated. However, if the command is run with the `--scan` flag, all files will be scanned for possible interpolations (i.e. parts of the file matching our interpolation format).


### Interpolation methods

The interpolation template syntax supports methods. Interpolated variables can be piped into methods in the following way:

```
A file with some $${interpolated|upper} content.
```

Suppose we enter the value `nice` for the interpolation `interpolated`. This results in the following file:

```
A file with some NICE content.
```

Multiple methods can be chained:

```
A file with some $${interpolated|lower|upperFirst} content.
```

Suppose now that we have entered the value `CONSTANT` for the interpolation `interpolated`. This results in the following file:

```
A file with some Constant content
```

Typical includes the following methods by default:

| Method | Description |
|--------|-------------|
| sha1   | Calculates the sha1 of a string, outputted as hex |
| sha256 | Calculates the sha256 of a string, outputted as hex |
| upperFirst | Makes the first letter of a string uppercase, if this is defined for the letter |
| upper | Makes the entire string uppercase, for those letters that this operation is defined |
| lower | Makes the entire string lowercase, for those letters that this operation is defined | 
| random | Creates a random 32-byte string, outputted in base64 |
| randomHex | Creates a random 32-byte string, outputted in hex |
| randomUrlSafe | Creates a random 32-byte string, outputted as url-safe base64 |

#### Adding custom methods

## Hooks

When typical runs, events are emitted during processing. You can hook into these to perform custom processing.
To listen to an event, you have to create a javascript file like follows:

```
const typical = require('typical.js')

typical.hook(
  typical.hooks.types.beforeAll,
  (data) => {
    // Do something
  }
)
```

The location of the file is either in a `__hooks__` folder under a .typicalfolders recipe, or in a `__hooks__` key in a .typicalrc recipe:

**.typicalfolders**:
```
.
├── __hooks__
│   ├── 01_create-react-app.js
│   └── 02_install_dependencies.js
├── __interpolations__
└── src
    ...
```

**.typicalrc**:
```json
{
  "src": {
     ...
  },
  "__interpolations__": [
    "Interpolate"
  ],
  "__hooks__": {
    "01_log": "const typical = require('typical'); typical.hook('beforeAll', console.log);"
  },
  "__cwd__": "/home/username/some/location"
}
```
Note that the `__hooks__` key in a .typicalrc can either be an Array or an Object, and may contain nested data. If an Array is encountered, an element of the Array is assumed to be named the empty string `''`.

Hooks are sorted alphabetically before being run, allowing user-specified precedence of the hook-scripts.

All events emit a data object, or undefined. The following table contains an overview. The order of the events are roughly the order in which they are emitted.

| Event | Data object |
|-------|-------------|
| recipeFound | The [config-object](#Config-object_of_a_recipe) of the recipe  |
| beforeAll | The [config-object](#Config-object_of_a_recipe) of the recipe  |
| interpolationsResolved | An array containing all resolved interpolations |
| beforeFileWrite | `{filePath, content}`|
| fileEmitContents | `{filePath, content}`|
| afterFileWrite | `{filePath, content}}`|
| beforeDirectoryWrite | `{directoryPath}`|
| afterDirectoryWrite | `{directoryPath}}`|
| afterAll | The [config-object](#Config-object_of_a_recipe) of the recipe |

### Hook events
#### recipeFound

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called when a recipe is found matching the user's intent. | The [config-object](#Config-object_of_a_recipe) of the recipe | Will ignore the return value |

#### beforeAll

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called just before typical is about to start writing | The [config-object](#Config-object_of_a_recipe) of the recipe | Will ignore the return value |

#### interpolationResolved

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Call when all interpolations are resolved by the user and has gotten a value. | An array containing all resolved interpolations  | Will ignore the return value |

#### beforeFileWrite

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called when typical has found a new file to write. | `{filePath, content}` | If the return-value is falsy (but not undefined, i.e. 0, null or the empty string) the file will not be written. |

#### fileEmitContents

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| This is called just before a new file is about to be created with contents. The file will now unequivocally be written. | `{filePath, content}` | If the return-data is not an Object with the same structure as the data-argument, the behaviour is undefined. If the return-data is an Object with the same structure, i.e. contains `filePath` and `content`, typical will instead write this content to the specified filePath. This permits you to write hooks overriding what content to write. |

#### afterFileWrite

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called after a file is succesfully written | `{filePath, content}` | Will ignore the return value |

#### beforeDirectoryWrite

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called when typical has found a new directory to write. | `{directoryPath}` | If the return-value is falsy (but not undefined, i.e. 0, null or the empty string) the directory and all its descendants will not be written. |

#### afterDirectoryWrite


| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called when typical has created a new directory. Note that this called before any descendant files are created in the directory | `{directoryPath}` | If the return-value is falsy (but not undefined, i.e. 0, null or the empty string) the directory and all its descendants will not be written. |


#### afterAll

| Description | Data given | Response on return value |
|-------------|------------|--------------------------|
| Called after a recipe has finished running. | The [config-object](#Config-object_of_a_recipe) of the recipe | Will ignore the return value |


## Config-object of a recipe

When a recipe is found matching the users intent, a config-object is created containing the data for the recipe. The config-object takes two different shapes; depending on whether or not the recipe is a folder-recipe or a standard recipe. This is of interest when using [hooks](#hooks), as this config object

### Standard recipe (.typicalrc)

This is just a duplicate of the resolved .typicalrc element itself. Say the recipe of choice is `myRecipe`, in the following .typicalrc:

```json
{
  "myRecipe": {
    "myFile": "$${Interpolate} this",
    "__interpolations__": [
      "Interpolate"
    ],
    "__hooks__": [
      "const typical = require('typical'); typical.hook('beforeAll', console.log);"
    ]
  }
}

```

Then the following object would be the config-object of `myRecipe`:

```json
{
  "myFile": "$${Interpolate} this",
  "__interpolations__": [
    "Interpolate"
  ],
  "__hooks__": [
    "const typical = require('typical'); typical.hook('beforeAll', console.log);"
  ],
  "__cwd__": "/home/username/some/location"
}
```

### Folder-recipe (.typicalfolders)

For folder-recipes, the entire directory structure (with contents) are _not_ loaded into memory. And so the config-object takes a slightly different shape. Given the same config as above, just as a folder-config located in the home directory config `/home/username/.typicalfolders`, we would get the following config:

```json
{
  "__isDirectory__": true,
  "path": "/home/username/.typicalfolders/myRecipe",
  "__interpolations__": [
    "Interpolate"
  ],
  "__cwd__": "/home/username/some/location"
}

```

Note here that we do not have any files explicitly in the config. This also includes the __hooks__ directory, which will be loaded from `path.resolve(configElement.path, '__hooks__')`.

## .typicalrc vs .typicalfolders

## TODO

 * Support YAML-config
 * Support symbolic links in  .typicalrc files
