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
		page_loaded_action_id: -1, 
		actions: [],
	};

	this.actions.forEach(function(action){
		if(that.pageLoadedAction == action) {
			obj.page_loaded_action_id = obj.actions.length;
		}

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

	this.pageLoadedAction = this.actions[obj.page_loaded_action_id];
}

module.exports = {
	TestPage: TestPage,
}