var util = require("util");

function PageAction()
{
	this.pageId = 0;
}

function PageLoadedAction()
{
	PageLoadedAction.super_.call(this);	
}

util.inherits(PageLoadedAction, PageAction);

function ElementClickedAction()
{
	ElementClickedAction.super_.call(this);
}

util.inherits(ElementClickedAction, PageAction);

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

//export ALL the classes!
module.exports = {
	PageAction: PageAction,
	PageLoadedAction: PageLoadedAction,
	ElementClickedAction: ElementClickedAction,
	SubtreeModifiedAction: SubtreeModifiedAction,
	KeyboardAction: KeyboardAction,
	ElementFocusedAction: ElementFocusedAction,
	ElementBluredAction: ElementBluredAction,
}