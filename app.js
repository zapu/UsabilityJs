var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");

var router = require("./router");
var templates = require("./templates");

//Requiring mysqlcli will also set up the connection
var mysqlcli = require("./mysqlcli");

var proxyModule = require("./proxy");
var testManagerModule = require("./testing/manager");

var testManager = new testManagerModule.TestManager();

//Require controllers and install them (sets up routes etc.)
require("./controllers/scenarios").install(testManager);
require("./controllers/tests").install(testManager);

//Mime types
var mimes = require("./mimes");

//Add default routes
router.addRoute("/favicon.ico", function(request, response, params) {
	return staticRoute(request, response, { 1: "favicon.ico"});
});

router.addRoute("/", function(request, response, params) {
	response.writeHead(200);
	response.end(templates.render("views/index.ejs", {PageTitle: "Title"}));
});

router.addRoute(/static\/(.*)/, staticRoute);

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

var proxy = new proxyModule.Proxy(testManager);
proxy.startServer(8081);

var socketio = require("socket.io").listen(server);

socketio.sockets.on("connection", function(socket) {
	testManager.bindToSocketIO(socket);
});

socketio.set('log level', 1);