
var fs = require("fs");
var ejs = require("ejs");

module.exports = new Templates();

function Templates()
{
	this.templates = {};
}

Templates.prototype.render = function(templateName, locals)
{
	return this.templates[templateName](locals);
}

Templates.prototype.addDefaultTemplates = function()
{
	this.addTemplatesFromDir("views");
}

Templates.prototype.addTemplatesFromDir = function(dir)
{
	var currentDir = dir + "/";
	var files = fs.readdirSync(currentDir);
	var len = files.length;
	var currentFile;
	var stats;
	
	console.log("parsing dir " + currentDir);
	
	for(var i = 0; i < len; ++i) {
		currentFile = currentDir + files[i];
		stats = fs.statSync(currentFile);
		if(stats.isDirectory()) {
			this.addTemplatesFromDir(currentFile);
		} else {
			this.addTemplate(currentFile);		
		}
	}
}

Templates.prototype.addTemplate = function(file)
{
	var str = fs.readFileSync(file, "utf8");
	var func = ejs.compile(str, {});
	this.templates[file] = func;
}