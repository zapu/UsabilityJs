var TestReport = require("./report").TestReport;
var TestPage = require("./report").TestPage;

var mathuuid = require("../mathuuid");

var testReportsModel = require("../models/testreports");

function TestManager()
{
	this.testMap = {};
}

TestManager.prototype.beginNewTest = function(scenario)
{
	var test = this._createTestReport(scenario);
	test.active = true;
	
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
	test.setScenario(scenario);
	test.reportStartTime = new Date();
	return test;
}

TestManager.prototype.getReportByUUID = function(uuid)
{
	return this.testMap[uuid];
}

TestManager.prototype.saveAndRemoveTest = function(test, success, callback)
{
	var that = this;
	test.onTestEnd(success);

	testReportsModel.addTestReport(test, function(res){
		delete that.testMap[test.uuid];
		callback(res);
	});
}

TestManager.prototype.unserializeReport = function(obj)
{
	var report = new TestReport(0);
	report.unserialize(obj);
	return report;
}

module.exports = {
	TestManager: TestManager,
}