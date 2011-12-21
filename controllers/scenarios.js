
//Install routes
var router = require("../router");
var templates = require("../templates");
var scenariosModel = require("../models/scenarios");

function listScenarios(request, response, params)
{
	response.writeHead(200);
	
	scenariosModel.getAllScenarios(function(scenarios) {
		var viewParams = {scenarios: scenarios};
		var text = templates.render("views/scenarios/list.ejs", viewParams);
		
		response.end(text);
	});
}

function showScenario(request, response, params)
{
	response.writeHead(200);
	
	scenariosModel.getScenarioById(params["id"], function(scenario) {		
		if(scenario == null) {
			response.write("<b>scenario not found.</b>");
			response.end();
		} else {
			var viewParams = {scenario: scenario};
			var text = templates.render("views/scenarios/show.ejs", viewParams);
			
			response.end(text);
		}
	});
}

module.exports.install = function(_testManager)
{
	router.addRoute("/scenarios", listScenarios);
	router.addRoute("/scenarios/show/:id", showScenario);
}