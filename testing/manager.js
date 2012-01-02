var TestReport = require("./report").TestReport;
var TestPage = require("./report").TestPage;

var mathuuid = require("../mathuuid");

function TestManager()
{
	this.testMap = {};
}

TestManager.prototype.beginNewTest = function(scenario)
{
	var test = this._createTestReport(scenario);
	
	return test;	
}

TestManager.prototype._createUUID = function()
{
	for(;;)
	{
		var uuid = mathuuid.uuidFast();
		if(uuid in this.testMap)
			continue;
			
		return uuid;
	}
}

TestManager.prototype._createTestReport = function(scenario)
{
	var uuid = this._createUUID();
			
	var test = new TestReport(uuid);
	this.testMap[uuid] = test;
	test.setScenario(scenario);
	return test;
}

TestManager.prototype.getReportByUUID = function(uuid)
{
	return this.testMap[uuid];
}

TestManager.prototype.bindToSocketIO = function(socket)
{	
	var that = this;
	
	socket.on('test_subscribe', function(msg) {	
		var test = that.testMap[msg.uuid];
		if(test == null) {
			socket.emit('error', {msg: 'wrong test uuid'});
			return;
		}
		
		test.bindToSocketIO(socket);
	});
}

module.exports = {
	TestManager: TestManager,
}