#!/usr/bin/env node

var pm2I = require('./index.js');
var argv = require('yargs')
	.usage('pm2i [filter]')
	.version(function() {
    return require('./package').version;
  })
	.help('h')
	.alias('h', 'help')
	.epilog('copyright 2015')
	.argv;

pm2I(argv._[0]);
