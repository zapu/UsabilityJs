
var sys = require("sys");
var url = require("url");

module.exports = {
	TestReport: TestReport,
	TestPage: TestPage,
}

//Classes for test in progress
function TestReport(uuid)
{
	this.pages = [];
	this.lastPageId = 0;
	this.uuid = uuid;
	this.dbId = 0;
	this.scenario = null;
	
	this.listeners = [];
}

TestReport.prototype.getStartingLocation = function()
{
	return this.scenario["address"] + "?__ujs_token=" + this.uuid;
}

TestReport.prototype.endTest = function()
{
	//Insert to mysql here
}

TestReport.prototype.findReferedPage = function(referer)
{
	var url_parts = url.parse(referer, true);
	var fullpath = url_parts.pathname + url_parts.search;
	for(i = this.pages.length - 1; i > 0; i++) {
		var page = this.pages[i];
		if(page.address == fullpath) {
			return page;
		}
	}

	return null;
}

TestReport.prototype.proxyHit = function(contentType, requestOptions, data)
{
	console.log("ProxyHit: " + this.uuid + " " + sys.inspect(contentType) + " " + 
		requestOptions.host + " " + requestOptions.path + " " + requestOptions.headers.referer);

	if(contentType.type == "text/html") {
		var page = new TestPage(this.pages.length);
		this.pages.push(page);

		page.address = requestOptions.path;
		page.referer = requestOptions.headers.referer;
		page.date = new Date();
	} else {
		var referPage = this.findReferedPage(requestOptions.headers.referer);
		if(referPage) {
			var resource = new TestPageResource();
			referPage.addTestResource(resource);

			resource.contentType = contentType.type;
			resource.address = requestOptions.path;
			resource.date = new Date();
		} else {
			console.log("No proxy refer page for resource " + requestOptions.headers.referer);
			//what do?	
		}
	}
}

TestReport.prototype.pageVisited = function(request, response, buffer)
{
	var page = new TestPage(this.pages.length);
	this.pages.push(page);
	
	page.address = request.url;

	this.listeners.forEach(function(socket){
		socket.emit('new_test_page', {page: page});
	});
	
	return page;
}

TestReport.prototype.bindToSocketIO = function(socket)
{
	this.listeners.push(socket);

	var that = this;	
	socket.on('disconnect', function(){
		var index = that.listeners.indexOf(socket);
		delete that.listeners[index];
	});
}

//Class for test page
function TestPage(id)
{
	this.id = id;
	this.address = "";
	this.actions = [];
	this.resources = [];
}

TestPage.prototype.addTestResource = function(resource)
{
	resource.id = this.resources.length;
	this.resources.push(resource);

	resource.parent = this;
}

//Class for resources in test pages, be it json (fetched with ajax), images, css etc.
function TestPageResource()
{

}