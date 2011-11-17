var actions = require("./actions");
var page = require("./page");
var request = require("./request");

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
TestReport.prototype.onProxyRequest = function(request)
{
	//just check if request should be forwarded or kept, 
	//do not actually do anything, wait for onProxyRequestCompleted
}

TestReport.prototype.onProxyRequestCompleted = function (request, requestOptions, response)
{
	//check request and react accordingly
}

//Handler for responses to proxified requests
TestReport.prototype.proxyResponse = function(params)
{
	
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