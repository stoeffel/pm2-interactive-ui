'use strict';
var pm2 = require('pm2'),
	curry2 = require('1-liners/curry2'),
	map = curry2(require('1-liners/map')),
	filter = curry2(require('1-liners/filter')),
	compose = require('1-liners/compose'),
	logSymbols = require('log-symbols'),
	inquirer = require('inquirer'),
	YOU_DONE = require('./you-done'),
	STATES = {
		'online': 'success',
		'stopped': 'warning',
		'stopping': 'info',
		'launching': 'info',
		'errored': 'error'
	};

require('shelljs/global');

function youDone(filterStr) {
	inquirer.prompt(YOU_DONE, function(answer) {
		if (answer.done) {
			process.exit(0);
		} else {
			chooseProcess(filterStr, true);
		}
	});
}

function onError(err) {
	console.error(err.message);
	process.exit(1);
}

function chooseProcess(filterStr, notDoneYet, command) {
	pm2.list(function(err, ret) {
		if (err) onError(err);


		var askForFilter = [{
			type: "input",
			name: "filter",
			message: "Filter processes",
			default:   function() { return filterStr || ''; }
		}];

		if (filterStr && !notDoneYet) {
			chooseFromList({
				filter: filterStr
			});
		} else {
			inquirer.prompt(askForFilter, chooseFromList);
		}

		function chooseFromList(answer) {
			var filters = answer.filter;
			filterStr = filters;
			if (!Array.isArray(answer.filter)) {
				filters = answer.filter.split(' ');
			}
			var actions;
			if (!command)
				actions = {
					type: "expand",
					name: "task",
					message: "Choose a task?",
					choices: [{
						key: 'r',
						value: 'restart',
						name: 'Restart'
					}, {
						key: 's',
						value: 'stop',
						name: 'Stop'
					}, {
						key: 'l',
						value: 'logs',
						name: 'Logs'
					}]
				};

			var prompts = [{
				type: "list",
				name: "process",
				message: "Choose a process?",
				choices:
					compose(
						filter(function(choice) {
							return filters.reduce(function(prev, curr) {
								if (!prev) return false;
								return choice.value.indexOf(curr) >= 0;
							}, true);
						}),
						map(function(proc) {
							return {
								value: proc.name,
								name: logSymbols[STATES[proc.pm2_env.status]] + ' ' + proc.name
							};
						})
					)(ret).concat([
						new inquirer.Separator(), {
							value: 'all',
							name: 'all'
						}
					])
			}];

			if (actions) prompts.push(actions);
			inquirer.prompt(prompts, function(answers) {
				if (command) answers.task = command;
				command = undefined;
				if (answers.task === 'logs') {
					exec('pm2 logs ' + answers.process);
				} else {
					pm2[answers.task](answers.process, function(err, data) {
						if (err) onError(err);
						console.log(answers.process, answers.task, data.success ? logSymbols.success : logSymbols.error);

						youDone(filterStr);
					});
				}
			});
		}
	});
}

module.exports = function(filterStr, command) {
	pm2.connect(function() {
		chooseProcess(filterStr, null, command);
	});
};

