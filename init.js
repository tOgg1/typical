#! /usr/bin/env node
let fs = require('fs')

fs.writeFile('.typicalrc', '{\n}', error => {
  if (error) {
    throw error
  }
})
