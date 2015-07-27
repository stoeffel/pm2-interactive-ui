#!/usr/bin/env node

var pm2I = require('./index.js');
var argv = require('yargs')
	.usage('pm2i [filter]')
	.version(function() {
    return require('./package').version;
  })
	.help('h')
	.alias('h', 'help')
	.alias('r', 'restart')
	.alias('l', 'logs')
	.alias('s', 'stop')
	.epilog('copyright 2015')
	.argv;

var filters = argv._.length > 0 ? argv._ : false;
var command;
if (argv.r) command = 'restart';
if (argv.l) command = 'logs';
if (argv.s) command = 'stop';
pm2I(filters, command);
