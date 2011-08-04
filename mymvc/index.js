require.paths.unshift('/node_modules');
var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requesthandlers');

var handle = {}
handle['/'] = "start";
handle['/start'] = "start";
handle['/show'] = "show";

server.start(router.route, handle);
