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
	action.pageId = this.id;
}

TestPage.prototype.serialize = function()
{
	var that = this;

	var obj = {
		id: this.id,
		request_id: -1,
		actions: [],
	};

	obj.page_loaded_action = this.pageLoadedAction.serialize();

	this.actions.forEach(function(action){
		obj.actions.push(action.serialize());
	});

	if(this.request != null) {
		obj.request_id = this.request.id;
	}

	return obj;
}

TestPage.prototype.unserialize = function(obj)
{
	var that = this;

	obj.actions.forEach(function(action_object) {
		var action = actions.UnserializeAction(action_object);
		that.actions.push(action);
	});

	this.pageLoadedAction = actions.UnserializeAction(obj.page_loaded_action);
}

module.exports = {
	TestPage: TestPage,
}