var actions = require("./actions");
var page = require("./page");
var request = require("./request");
var fs = require("fs");

function TestReport(uuid)
{
	this.pages = [];
	this.requests = [];
	this.uuid = uuid;
	this.scenario = null;
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
	if(action instanceof actions.actions.PageLoadedAction) {
		var page = this._createPage(action);
		return page;
	} else {
		var page = this.pages[action.pageId];
		page.addPageAction(action);

		return page;
	}
}

//Handler for requests, can decide whether to forward it or not
TestReport.prototype.onProxyRequest = function(requestOptions)
{
	//just check if request should be forwarded or kept, 
	//do not actually do anything, wait for onProxyRequestCompleted
	if(requestOptions.path == "/__ujs_inject.js") {
		return true;
	} else if(requestOptions.path == "/__ujs_callback") {
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
	} else if(requestOptions.path == "/__ujs_callback") {
		//get payload from post
		try {
			var payload = JSON.parse(buffer.toString());
		} catch(err) {
			console.log("ujs callback error " + err);
			return;
		}

		var action = actions.CreateAction(payload);
		if(action != null) {
			var page = this.addAction(action);
			var res = {ok: true, pageId: page.id};

			response.writeHead(200, {"content-type": "application/json"});
			response.write(JSON.stringify(res));
			response.end();
		}
	}
}

//Handler for responses to proxified requests
TestReport.prototype.proxyResponse = function(params)
{
	console.log("Proxyfing: " + params.RequestOptions.path);
	//Decide if inject <script src="__ujs_inject.js"
	//Also decorate with __ujs_request_id var
	var testRequest = new request.TestRequest();
	this.addRequest(testRequest);

	if(params.ContentType.type == "text/html") {
		var tagStart = "<script type=\"text/javascript\"";
		var tagEnd = "</script>";

		var includeJs = tagStart + " src=\"/__ujs_inject.js\">" + tagEnd;
		var requestId = tagStart + "> __ujs_request_id = " + testRequest.id + ";" + tagEnd;
		var serializedScenario = tagStart + "> __ujs_scenario = " + JSON.stringify(this.scenario) + ";" + tagEnd;
		params.DecorBuffer = new Buffer(requestId + serializedScenario + includeJs+ "\n");
	}
}

TestReport.prototype._createPage = function(pageLoadedAction)
{
	var id = this.pages.length;
	var test_page = new page.TestPage(id, pageLoadedAction);
	this.pages.push(test_page);
	test_page.request = this.requests[pageLoadedAction.requestId];
	test_page.date = new Date();
	return test_page;
}

TestReport.prototype.getStartingLocation = function()
{
	return this.scenario["address"] + "?__ujs_token=" + this.uuid;
}

module.exports = {
	TestReport: TestReport,
}