var fs = require('fs');

function route(handle, path, response, request) {
	 	try {
				if (path.toString().search(/\/public\//g) != -1) {
						console.log("Got request for a public resource: " + path);
						//var test = require("." + path);
						renderTemplate(response, "", "." + path);
				}
				else {
						var route = require("./views/" + handle[path] + ".js");
						console.log(route);
      			route[handle[path]](response, request);
				}
		}
    catch (e) {
        console.log("Failed to find a route for: '" + path + "' from:" + request.connection.remoteAddress);
        console.log("Error: " + e);
        response.writeHead(404, {"Content-Type" : "text/plain"});
        response.write("Failed to find resource");
        response.end();
    }
}


function renderTemplate(response, content, templatePath) {
		// Check for a template and continue rendering
		try {
				fs.readFile(templatePath, function(err, data) {
						if (err) throw err;
						// Should merge the content and the template here
						data.toString().replace("{CONTENT}", content);
						renderPage(data, response);
				});
		}
		catch (err) {
			console.log("No template found: " + err);
			// If no template, then just render whatever content we have
			renderPage(content, response);
		}
}

function renderPage(body, response) {
    response.writeHead(200, {"Content-Type" : "text/html"});
    response.write(body);
    response.end();
}

exports.route = route;
exports.renderTemplate = renderTemplate;
exports.renderPage = renderPage;
