var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

var router = require("./router");
var templates = require("./templates");

//Requiring mysqlcli will also set up the connection
var mysqlcli = require("./mysqlcli");

//Proxy engine, module starts server on its own
var proxy = require("./proxy");

//Require controllers which install routes by themselves
require("./controllers/scenarios");
require("./controllers/tests");

//Mime types
var mimes = require("./mimes");

//Add default routes
router.addRoute("/favicon.ico", function(request, response, params) {
	return staticRoute(request, response, { 1: "favicon.ico"});
});

router.addRoute("/", function(request, response, params) {
	response.writeHead(200);
	response.end(templates.render("views/index.ejs", {}));
});

//Parse templates (views)
templates.addDefaultTemplates();

function global404(request, response)
{
	response.writeHead(404);
	response.end(templates.render("views/404.ejs", {}));
}

function staticRoute(request, response, params)
{
	var filename = "static/" + params[1];
	var directory = path.dirname(path.normalize(filename));

	if(directory.indexOf("static") != 0) {
		global404(request, response);
		return;
	}
	
	fs.readFile(filename, function(error, file) {
		if(error) {
			global404(request, response);
		} else {
			var extension = path.extname(filename);
			var mime = mimes.ext.getContentType(extension);
			
			response.writeHead(200, {"Content-Type": mime});
			response.write(file, file);
			response.end();
		}
	});
}

function onRequest(request, response)
{
	if(!router.routeRequest(request, response)) {
		global404(request, response);
	}
}

var server = http.createServer(onRequest);
server.listen(8080);