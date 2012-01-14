var actions = require("./actions");
var page = require("./page");
var request = require("./request");
var fs = require("fs");
var config = require("../config");

var templates = require("../templates");
templates.addTemplate("injected_js/script.ejs");

function TestReport(uuid)
{
	this.uuid = uuid;
	this.scenario = null;

	this.pages = [];
	this.requests = [];

	this.active = false;

	this.currentTask = 0;
	this.lastTaskChangeTime = 0;
	this.taskInfos = [];

	this.reportStartTime = 0;
	this.reportEndTime = 0;
}

TestReport.prototype.setCurrentTask = function(task)
{
	if(task == this.currentTask)
		return;

	this.taskInfos[this.currentTask].time += new Date() - this.lastTaskChangeTime;
	this.lastTaskChangeTime = new Date();

	this.currentTask = task;
	this.taskInfos[this.currentTask].visited = true;
}

TestReport.prototype.addRequest = function(request)
{
	if(this.requests.length == 0) {
		//first request
		this.lastTaskChangeTime = new Date();
	}

	var id = this.requests.length;
	request.id = id;
	this.requests.push(request);

	return id;
}

TestReport.prototype.addAction = function(action)
{
	action.taskNum = this.currentTask;
	action.time = new Date();
	action.deltatime = this.getRelativeFormattedTime(action.time);

	if(action instanceof actions.actions.PageLoadedAction) {
		var page = this._createPage(action);
		return page;
	} else {
		var page = this.pages[action.pageId];
		page.addPageAction(action);

		if(action instanceof actions.actions.TaskChangedAction) {
			this.setCurrentTask(action.task);
		}

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
		var params = {
			scenario: JSON.stringify(this.scenario),
			currentTask: this.currentTask,
			uuid: this.uuid,
			ujsUrl: config.url,
		};

		var text = templates.render("injected_js/script.ejs", params);

		response.writeHead(200, {"Content-Type": "application/javascript"});
		response.end(text);
	} else if(requestOptions.path == "/__ujs_callback") {
		//get payload from post
		try {
			var payload = JSON.parse(buffer.toString());
		} catch(err) {
			console.log("ujs callback error ", err);
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
	testRequest.path = params.RequestOptions.path;
	this.addRequest(testRequest);

	if(params.ContentType.type == "text/html") {
		var tagStart = "<script type=\"text/javascript\"";
		var tagEnd = "</script>";

		var includeJs = tagStart + " src=\"/__ujs_inject.js\">" + tagEnd;
		var requestId = tagStart + "> __ujs_request_id = " + testRequest.id + ";" + tagEnd;

		var stylesheet = "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + config.url + "static/injected_style.css\">";

		params.DecorBuffer = new Buffer(requestId + stylesheet + includeJs + "\n");
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

TestReport.prototype.getCurrentTaskObject = function()
{
	return this.scenario.tasks[this.currentTask];
}

TestReport.prototype.setScenario = function(scenario)
{
	this.scenario = scenario;

	var that = this;
	//Add empty taskinfos
	scenario.tasks.forEach(function(task){
		that.taskInfos.push({
			time: 0,
			visited: false,
		});
	});

	this.taskInfos[0].visited = true; //first task
}

TestReport.prototype.getTaskTotalTime = function(tasknum)
{
	if(this.active && this.currentTask == tasknum) {
		return (new Date() - this.lastTaskChangeTime) + this.taskInfos[tasknum].time;
	}

	return this.taskInfos[tasknum].time;
}

TestReport.prototype.isTaskVisited = function(tasknum)
{
	return this.taskInfos[tasknum].visited;
}

TestReport.prototype.getTotalReportTime = function()
{
	return this.reportEndTime - this.reportStartTime;
}

TestReport.prototype.formatTimeDuration = function(t)
{
	var result = {
		totalms: t,
	};

	result.hours = t / 3600000 | 0;
	t = t % 3600000;
	result.minutes = t / 60000 | 0;
	t = t % 60000;
	result.seconds = t / 1000 | 0; 
	result.milliseconds = t % 1000;

	return result;
}

TestReport.prototype.getRelativeFormattedTime = function(time)
{
	var t = time - this.reportStartTime;

	return this.formatTimeDuration(t);
}

TestReport.prototype.serialize = function()
{
	var obj = {
		uuid: this.uuid,
		scenario_id: -1,
		start_time: this.reportStartTime,
		end_time: this.reportEndTime,
		pages: [],
		requests: [],
		task_infos: this.taskInfos,
	};

	if(this.scenario != null) {
		obj.scenario_id = this.scenario._id;
	}

	this.requests.forEach(function(request){
		//set serializedId so we can serialize TestPages later
		obj.requests.push(request.serialize());
	});

	this.pages.forEach(function(page){
		obj.pages.push(page.serialize());
	});

	return obj;
}

TestReport.prototype.unserialize = function(obj)
{
	this.reportStartTime = new Date(obj.start_time);
	this.reportEndTime = new Date(obj.end_time);

	this.taskInfos = obj.task_infos;

	var that = this;

	obj.requests.forEach(function(request_object){
		var req = new request.TestRequest();
		req.unserialize(request_object);
		that.requests[req.id] = req;
	});

	obj.pages.forEach(function(page_object){
		var testpage = new page.TestPage(page_object.id, {});
		testpage.unserialize(page_object);
		testpage.request = that.requests[page_object.request_id];
		that.pages[testpage.id] = testpage;
	});
}

TestReport.prototype.onTestEnd = function()
{
	this.taskInfos[this.currentTask].time += new Date() - this.lastTaskChangeTime;
	this.active = false;
	this.reportEndTime = new Date();
}

module.exports = {
	TestReport: TestReport,
}