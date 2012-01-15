
function TestRequest()
{
	this.id = 0;
	this.path = "";
	this.time = null;
	this.latency = 0;
}

TestRequest.prototype.serialize = function()
{
	return {
		id: this.id,
		path: this.path,
		time: this.time,
		latency: this.latency,
	};
}

TestRequest.prototype.unserialize = function(obj)
{
	this.id = obj.id;
	this.path = obj.path;
	this.time = new Date(obj.time);
	this.latency = obj.latency;
}

module.exports = {
	TestRequest: TestRequest,
}