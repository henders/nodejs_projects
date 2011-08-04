var querystring = require('querystring');

function show(response, request) {
    console.log("Showing image...");
    fs.readFile("/tmp/test.png", "binary", function(err, file) {
        if (err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
        }
        else {
            response.writeHead(200, {"Content-Type": "image/png"});
            response.write(file, "binary");
            response.end();
        }
    });
}

exports.show = show;
