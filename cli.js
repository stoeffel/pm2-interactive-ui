#!/usr/bin/env node

var pm2I = require('./index.js');
var argv = require('yargs').version(function() {
    return require('./package').version;
  }).argv;

pm2I(argv._[0]);
