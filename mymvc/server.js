var http = require('http');
var url = require('url');

function start(route, handle) {
    function request(request, response) {
        var requesturl = url.parse(request.url).pathname;
        var requests = url.parse(request.url, true).query;
        
        console.log("Got Request for:" + requesturl);
        route(handle, requesturl, response, request);    
    }

    http.createServer(request).listen(8080);
    console.log("Started Server....");
}

exports.start = start;

