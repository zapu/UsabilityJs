var actions = require("./actions");

function TestPage(id, action)
{
	this.pageLoadedAction = action;	
	action.pageId = id;

	this.actions = [];
	this.id = id;
	this.request = null;
}

TestPage.prototype.addPageAction = function(action)
{
	this.actions.push(action);
	action.pageId = this.pageId;
}

module.exports = {
	TestPage: TestPage,
}