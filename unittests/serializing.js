var testCase = require("nodeunit").testCase;
var TestReport = require("../testing/report").TestReport;
var request = require("../testing/request");
var actions = require("../testing/actions");

module.exports = testCase({
	setUp: function(callback)
	{
		//this.testManager = new manager.TestManager();

		callback();
	},

	tearDown: function(callback)
	{
		callback();
	},

	addTest1: function(test)
	{	
		var report = new TestReport("testuuid");

		var testRequest = new request.TestRequest();
		testRequest.path = "/test/path.php";
		var requestId = report.addRequest(testRequest);

		var pageLoadedAction = actions.CreateAction({action: "PageLoadedAction", requestId: requestId});
		var page = report.addAction(pageLoadedAction);

		var clickAction = actions.CreateAction({action: "ElementClickedAction", pageId: page.id, element: {}});
		var page2 = report.addAction(clickAction);

		var obj = report.serialize();
		console.dir(obj, 7);
		test.done();
	},
});
