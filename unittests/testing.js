var testCase = require("nodeunit").testCase;

var manager = require("../testing/manager");

module.exports = testCase({
	setUp: function(callback)
	{
		this.testManager = new manager.TestManager();

		callback();
	},

	tearDown: function(callback)
	{
		callback();
	},

	addTest1: function(test)
	{	
		var report = this.testManager._createTestReport(null);
		test.ok(this.testManager.getReportByUUID(report.uuid) == report, "Report added by uuid");
		test.done();
	},

	beginTest1: function(test)
	{
		var report = this.testManager.beginNewTest(null);
		test.ok(this.testManager.getReportByUUID(report.uuid) == report, "Report added by uuid");
		test.done();
	},
});
