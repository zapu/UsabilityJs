var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

var router = require("./router");


router.addRoute("/favicon.ico", function(request, response, params) {
	return staticRoute(request, response, { 1: "favicon.ico"});
});

router.addRoute("/test/:id/:id2", testRoute);
router.addRoute(/^\/static\/(.*)$/, staticRoute);

function testRoute(request, response, params)
{
	response.writeHead(200);
	response.write("Hello id1: " + params["id"] + " id2: " + params["id2"]);
	console.log(params);
	response.end();
}

function staticRoute(request, response, params)
{
	var filename = "static/" + params[1];
	var directory = path.dirname(path.normalize(filename));
	
	console.log("Accessing " + filename + " in " + directory);
	if(directory.indexOf("static") != 0) {
		response.writeHead(404);
		response.write("404");
		response.end();
		return;
	}
	
	fs.readFile(filename, function(error, file) {
		if(error) {
			response.writeHead(404);
			response.write("404");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type": "image/ico"});
			response.write(file, file);
			response.end();
		}
	});
}

function onRequest(request, response)
{
	if(!router.routeRequest(request, response)) {
		response.writeHead(404);
		response.write("404");
		response.end();
	}
}

var server = http.createServer(onRequest);
server.listen(8080);