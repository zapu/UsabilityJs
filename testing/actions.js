var util = require("util");

function PageAction()
{
	this.pageId = -1;
	this.requestId = -1;
	this.taskNum = 0;
}

PageAction.prototype.loadFromPayload = function(payload)
{
	if(typeof payload.pageId != 'undefinied') {
		this.pageId = payload.pageId;
	}
}

PageAction.prototype.serialize = function()
{
	var obj = {};
	for(var key in this) {
		if(typeof this[key] != 'function') {
			obj[key] = this[key];
		}
	}
	obj._name = this.getName();

	return obj;
}

function PageLoadedAction()
{
	PageLoadedAction.super_.call(this);	
}

util.inherits(PageLoadedAction, PageAction);

PageLoadedAction.prototype.loadFromPayload = function(payload)
{
	PageAction.prototype.loadFromPayload.call(this, payload);
	this.requestId = payload.requestId;
}

PageLoadedAction.prototype.getName = function()
{
	return "PageLoaded";
}



function ElementClickedAction()
{
	ElementClickedAction.super_.call(this);
}

util.inherits(ElementClickedAction, PageAction);

ElementClickedAction.prototype.loadFromPayload = function(payload)
{
	PageAction.prototype.loadFromPayload.call(this, payload);
	this.element = payload.element;
}

ElementClickedAction.prototype.getName = function()
{
	return "ElementClicked";
}



function SubtreeModifiedAction()
{
	SubtreeModifiedAction.super_.call(this);
}

util.inherits(SubtreeModifiedAction, PageAction);

function KeyboardAction()
{
	KeyboardAction.super_.call(this);	
}

util.inherits(KeyboardAction, PageAction);




function ElementFocusedAction()
{
	ElementFocusedAction.super_.call(this);
}	

util.inherits(ElementFocusedAction, PageAction);

ElementFocusedAction.prototype.loadFromPayload = function(payload)
{
	PageAction.prototype.loadFromPayload.call(this, payload);
	this.element = payload.element;
}

ElementFocusedAction.prototype.getName = function()
{
	return "ElementFocused";
}


function ElementBlurredAction()
{
	ElementBlurredAction.super_.call(this);
}

util.inherits(ElementBlurredAction, PageAction);

ElementBlurredAction.prototype.loadFromPayload = function(payload)
{
	PageAction.prototype.loadFromPayload.call(this, payload);
	this.element = payload.element;
}

ElementBlurredAction.prototype.getName = function()
{
	return "ElementBlurred";
}



function InputValueChangedAction()
{
	InputValueChangedAction.super_.call(this);
}

util.inherits(InputValueChangedAction, PageAction);

InputValueChangedAction.prototype.loadFromPayload = function(payload)
{
	PageAction.prototype.loadFromPayload.call(this, payload);
	this.element = payload.element;
	this.value = payload.value;
}

InputValueChangedAction.prototype.getName = function()
{
	return "InputValueChanged";
}



function TaskChangedAction()
{
	TaskChangedAction.super_.call(this);
}

util.inherits(TaskChangedAction, PageAction);

TaskChangedAction.prototype.loadFromPayload = function(payload)
{
	PageAction.prototype.loadFromPayload.call(this, payload);
	this.task = payload.task;
}

TaskChangedAction.prototype.getName = function()
{
	return "TaskChanged";
}


//Action factory
function CreateAction(payload)
{
	var actionType = module.exports.actions[payload.action];
	if(actionType == undefined) {
		return null;
	}

	var action = new actionType();
	action.loadFromPayload(payload);

	return action;
}

//export ALL the classes
module.exports = {
	actions: {
		PageAction: PageAction,
		PageLoadedAction: PageLoadedAction,
		ElementClickedAction: ElementClickedAction,
		SubtreeModifiedAction: SubtreeModifiedAction,
		KeyboardAction: KeyboardAction,
		ElementFocusedAction: ElementFocusedAction,
		ElementBlurredAction: ElementBlurredAction,
		InputValueChangedAction: InputValueChangedAction,
		TaskChangedAction: TaskChangedAction,
	},

	CreateAction: CreateAction,
}