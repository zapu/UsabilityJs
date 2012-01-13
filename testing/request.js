
function TestRequest()
{
	this.id = 0;
	this.path = "";
}

TestRequest.prototype.serialize = function()
{
	return {
		id: this.id,
		path: this.path,
	};
}

TestRequest.prototype.unserialize = function(obj)
{
	this.id = obj.id;
	this.path = obj.path;
}

module.exports = {
	TestRequest: TestRequest,
}