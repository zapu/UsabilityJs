var util = require("util");

function PageAction()
{
	this.pageId = -1;
	this.requestId = -1;
}

PageAction.prototype.loadFromPayload = function(payload)
{
	if(typeof payload.pageId != 'undefinied') {
		this.pageId = payload.pageId;
	}
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

function ElementBluredAction()
{
	ElementBluredAction.super_.call(this);
}

util.inherits(ElementBluredAction, PageAction);

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

//export ALL the classes!
module.exports = {
	actions: {
		PageAction: PageAction,
		PageLoadedAction: PageLoadedAction,
		ElementClickedAction: ElementClickedAction,
		SubtreeModifiedAction: SubtreeModifiedAction,
		KeyboardAction: KeyboardAction,
		ElementFocusedAction: ElementFocusedAction,
		ElementBluredAction: ElementBluredAction,
	},

	CreateAction: CreateAction,
}