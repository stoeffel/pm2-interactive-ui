var mockery = require('mockery');
var pm2Mock = {
	connect: function(cb) {
		cb();
	},
	list: function(cb) {
		cb(null, [
				{ name: 'proc1', pm2_env: { status: 'online' }},
				{ name: 'proc2', pm2_env: { status: 'stopped' }},
				{ name: 'proc3', pm2_env: { status: 'stopping' }},
				{ name: 'proc4', pm2_env: { status: 'launching' }},
				{ name: 'proc5', pm2_env: { status: 'errored' }}
		]);
	},
	restart: function(proc, cb) {
		cb(null, { success: true });
	},
	stop: function(proc, cb) {
		cb(null, { success: true });
	}
};
mockery.registerMock('pm2', pm2Mock);
mockery.enable();
mockery.warnOnUnregistered(false);

var pm2i = require('./');
global.exec = function(command) {
	console.log('would run', command);
}

pm2i();
