var testCase = require("nodeunit").testCase;

var report = require("../testing/report")
var actions = require("../testing/actions")
var manager = require("../testing/manager");
var request = require("../testing/request");

module.exports = testCase({
	setUp: function(callback)
	{
		this.testManager = new manager.TestManager();
		this.report = this.testManager.beginNewTest(null);

		callback();
	},

	tearDown: function(callback)
	{
		callback();	
	},

	addRequestAndAction: function(test)
	{
		var req = new request.TestRequest();
		this.report.addRequest(req);
		test.ok(req.id == 0, "First request id == 0");

		var page_action = new actions.actions.PageLoadedAction();
		page_action.requestId = req.id;
		//adding PageLoadedAction creates new TestPage linked with TestRequest linked to action
		var page = this.report.addAction(page_action); 
		test.ok(page.id == 0, "First page id == 0");
		test.ok(page_action.pageId == page.id, "Action.pageId == page.id");

		test.done();
	},
});