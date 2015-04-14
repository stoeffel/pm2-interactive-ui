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

function chooseProcess() {
	pm2.list(function(err, ret) {
		if (err) throw err;

		inquirer.prompt([{
			type: "input",
			name: "filter",
			message: "Filter processes",
		}], function(answer) {
			inquirer.prompt([
				{
					type: "list",
					name: "process",
					message: "Choose a process?",
					choices: ret.map(function(proc) {
						return {
							value: proc.name,
							name: logSymbols[STATES[proc.pm2_env.status]] + ' ' + proc.name
						};
					}).filter(function(choice) {
						return choice.value.indexOf(answer.filter) >= 0;
					}),
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
				}
			], function( answers ) {
				if (answers.task === 'logs') {
					exec('pm2 logs ' + answers.process);
				} else {
					pm2[answers.task](answers.process, function(err, data) {
						if (err) throw err;
						console.log(answers.process, answers.task, data.success?logSymbols.success:logSymbols.error);
						process.exit(0);
					});
				}
			});
		});
	});
}

module.exports = function (str, opts) {
	pm2.connect(function() {
		chooseProcess();
	});
};
