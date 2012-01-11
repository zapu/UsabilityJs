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
	var obj = {
		id: this.id,
		request_id: -1,
		page_loaded_action_id: -1, 
		actions: [],
	};

	this.actions.forEach(function(action){
		if(this.pageLoadedAction == action) {
			obj.page_loaded_action_id = obj.actions.length;
		}

		obj.actions.push(action.serialize());
	});

	if(this.request != null) {
		obj.request_id = this.request.id;
	}

	return obj;
}

module.exports = {
	TestPage: TestPage,
}