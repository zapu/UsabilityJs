
module.exports = {
	TestReport: TestReport,
	TestPage: TestPage,
}

//Classes for test in progress
function TestReport(uuid)
{
	this.pages = [];
	this.lastPageId = 0;
	this.uuid = uuid;
	this.dbId = 0;
	this.scenario = null;
	
	this.listeners = [];
}

TestReport.prototype.getStartingLocation = function()
{
	return this.scenario["address"] + "?__ujs_token=" + this.uuid;
}

TestReport.prototype.endTest = function()
{
	//Insert to mysql here
}

TestReport.prototype.proxyHit = function(content_type, data)
{
	
}

TestReport.prototype.pageVisited = function(request, response, buffer)
{
	var page = new TestPage(this.pages.length);
	this.pages.push(page);
	
	page.address = request.url;

	this.listeners.forEach(function(socket){
		socket.emit('new_test_page', {page: page});
	});
	
	return page;
}

TestReport.prototype.bindToSocketIO = function(socket)
{
	this.listeners.push(socket);
	
	socket.on('disconnect', function(){
		var index = this.listeners.indexOf(socket);
		delete this.listeners[index];
	});
}

//Class for a test artifact
function TestPage(id)
{
	this.id = id;
	this.address = "";
	this.actions = [];
}
