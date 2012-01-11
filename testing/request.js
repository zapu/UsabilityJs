
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

module.exports = {
	TestRequest: TestRequest,
}