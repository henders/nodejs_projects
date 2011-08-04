var router = require('../router.js');

function start(response, request) {
    console.log("Starting the App...");
		router.renderTemplate(response, "", "./templates/start.html");
}

exports.start = start;
