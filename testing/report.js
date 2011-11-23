var actions = require("./actions");
var page = require("./page");
var request = require("./request");
var fs = require("fs");

function TestReport(uuid)
{
	this.pages = [];
	this.requests = [];
	this.uuid = uuid;
}

TestReport.prototype.addRequest = function(request)
{
	var id = this.requests.length;
	request.id = id;
	this.requests.push(request);

	return id;
}

TestReport.prototype.addAction = function(action)
{
	if(action instanceof actions.PageLoadedAction) {
		var page = this._createPage(action);
		return page;
	} else {
		var page = this.pages[action.pageId];
		page.request = this.requests[action.requestId];
		page.addPageAction(action);

		return 0;
	}
}

//Handler for requests, can decide whether to forward it or not
TestReport.prototype.onProxyRequest = function(requestOptions)
{
	//just check if request should be forwarded or kept, 
	//do not actually do anything, wait for onProxyRequestCompleted
	if(requestOptions.path == "/__ujs_inject.js") {
		return true;
	}

	return false;
}

TestReport.prototype.onProxyRequestCompleted = function (request, requestOptions, buffer, response)
{
	//check request and react accordingly
	if(requestOptions.path == "/__ujs_inject.js") {
		fs.readFile("./injected_js/script.js", function(err, data){
			if(err) {
				response.writeHead(404);
				response.end();
			} else {
				response.writeHead(200, {"Content-Type": "application/javascript"});
				response.end(data);
			}
		});
	}
}

//Handler for responses to proxified requests
TestReport.prototype.proxyResponse = function(params)
{
	console.log("Proxyfing: " + params.RequestOptions.path);
	//Decide if inject <script src="__ujs_inject.js"
	//Also decorate with __ujs_request_id var

	if(params.ContentType.type == "text/html") {
		params.DecorBuffer = "HERP DERP UJS";//new Buffer("Herp Derp UJS LOL");
	}
}

TestReport.prototype._createPage = function(pageLoadedAction)
{
	var id = this.pages.length;
	var test_page = new page.TestPage(id, pageLoadedAction);
	this.pages.push(test_page);
	return test_page;
}

TestReport.prototype.getStartingLocation = function()
{
	return this.scenario["address"] + "?__ujs_token=" + this.uuid;
}

module.exports = {
	TestReport: TestReport,
}