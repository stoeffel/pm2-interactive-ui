'use strict';
var pm2 = require('pm2'),
	logSymbols = require('log-symbols'),
	inquirer = require('inquirer'),
	STATES = {
		'online': 'success',
		'stopped': 'warning',
		'stopping': 'info',
		'launching': 'info',
		'errored': 'error'
	};

require('shelljs/global');

function youDone() {
	inquirer.prompt([{
		type: "expand",
		name: "done",
		message: "Are you done?",
		choices: [{
			key: 'y',
			value: true,
			name: 'Yes'
		}, {
			key: 'n',
			value: false,
			name: 'No'
		}]
	}], function(answer) {
		if (answer.done) {
			process.exit(0);
		} else {
			chooseProcess();
		}
	});
}

function onError(err) {
	console.error(err.message);
	process.exit(1);
}

function chooseProcess(filter) {
	pm2.list(function(err, ret) {
		if (err) onError(err);

		if (filter) {
			chooseFromList({
				filter: filter
			});
		} else {
			inquirer.prompt([{
				type: "input",
				name: "filter",
				message: "Filter processes",
			}], chooseFromList);
		}

		function chooseFromList(answer) {
			var filters = answer.filter;
			if (!Array.isArray(answer.filter)) {
				filters = answer.filter.split(' ');
			}

			inquirer.prompt([{
				type: "list",
				name: "process",
				message: "Choose a process?",
				choices: [{
						value: 'all',
						name: 'all'
					},
					new inquirer.Separator()
				].concat(
					ret.map(function(proc) {
						return {
							value: proc.name,
							name: logSymbols[STATES[proc.pm2_env.status]] + ' ' + proc.name
						};
					}).filter(function(choice) {
						return filters.reduce(function(prev, curr) {
							if (!prev) return false;
							return choice.value.indexOf(curr) >= 0;
						}, true);
					}))
			}, {
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
			}], function(answers) {
				if (answers.task === 'logs') {
					exec('pm2 logs ' + answers.process);
				} else {
					pm2[answers.task](answers.process, function(err, data) {
						if (err) onError(err);
						console.log(answers.process, answers.task, data.success ? logSymbols.success : logSymbols.error);

						youDone();
					});
				}
			});
		}
	});
}

module.exports = function(filter) {
	pm2.connect(function() {
		chooseProcess(filter);
	});
};

