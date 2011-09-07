/*

Wejscie na strone przez proxy:
- inject cookie jesli jest get_token
- sprawdzenie czy jest cookie
- wygenerowanie page_token
- dodanie 'visited page' z tokenem do raportu
- dekoracja javascriptem
	- javascript wysyla akcje z page_token zeby dodac do odpowiedniego miejsca w raporcie

*/

var mathuuid = require("./mathuuid.js");

module.exports = new TestManager();

function TestManager()
{
	this.tests = [];
	this.testMap = {};
}

TestManager.prototype.startTestRedirect = function(request, response, url_parts)
{
	
}

TestManager.prototype.beginNewTest = function(scenario)
{
	var test = this._createTestReport(scenario);
	
	return test;	
}

TestManager.prototype._createUUID = function()
{
	for(;;)
	{
		var uuid = mathuuid.uuidFast();
		if(uuid in this.testMap)
			continue;
			
		return uuid;
	}
}

TestManager.prototype._createTestReport = function(scenario)
{
	var uuid = this._createUUID();
			
	var test = new TestReport(uuid);
	this.testMap[uuid] = test;
	test.scenario = scenario;
	return test;
}

TestManager.prototype.getTestByUUID = function(uuid)
{
	return this.testMap[uuid];
}

//Classes for test in progress
function TestReport(uuid)
{
	this.pages = [];
	this.lastPageId = 0;
	this.uuid = uuid;
	this.dbId = 0;
	this.scenario = null;
}

TestReport.prototype.getStartingLocation = function()
{
	return this.scenario["address"] + "?__ujs_token=" + this.uuid;
}

function TestPage(id)
{
	this.actions = [];
}