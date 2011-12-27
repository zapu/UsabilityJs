
//Install routes
var router = require("../router");
var templates = require("../templates");
var scenariosModel = require("../models/scenarios");
var sitesModel = require("../models/sites");

function listScenarios(request, response, params)
{
	if(params.length == 0) {
		//show sites
		response.writeHead(200);
		
		scenariosModel.getSites(function(sites) {
			var viewParams = {sites: sites};
			var text = templates.render("views/scenarios/list_sites.ejs", viewParams);
			
			response.end(text);
		});
	} else {
		var siteid = params['id'] || null;
		if(siteid == null) {
			response.writeHead(404);
			response.end("");
			return;
		}

		scenariosModel.getScenariosWithSite(siteid, function(site) {
			if(site == null) {
				response.writeHead(404);
				response.end("");
				return;		
			}

			response.writeHead(200);
			var viewParams = {site: site};
			var text = templates.render("views/scenarios/list.ejs", viewParams);
			response.end(text);
		});
	}
}

function showScenario(request, response, params)
{
	response.writeHead(200);
	
	scenariosModel.getScenarioById(params["id"], function(scenario) {		
	scenariosModel.getSiteById(scenario.site_id, function(site) {		
		if(scenario == null) {
			response.write("<b>scenario not found.</b>");
			response.end();
		} else {
			var viewParams = {scenario: scenario, site: site};
			var text = templates.render("views/scenarios/show.ejs", viewParams);
			
			response.end(text);
		}
	});
	});
}

function editScenarioForm(request, response, params)
{
	scenariosModel.getScenarioById(params["id"], function(scenario) {		
	scenariosModel.getSiteById(scenario.site_id, function(site) {		
		if(scenario == null) {
			response.writeHead(404);
			response.end("<b>scenario not found.</b>");
		} else {
			var viewParams = {scenario: scenario, site: site};
			var text = templates.render("views/scenarios/edit_scenario.ejs", viewParams);

			response.writeHead(200);		
			response.end(text);
		}
	});
	});
}

function editSiteForm(request, response, params)
{
	response.end();
}

module.exports.install = function(_testManager)
{
	router.addRoute("/scenarios/show/:id", showScenario);

	router.addRoute("/scenarios/edit_scenario/:id", editScenarioForm);
	router.addRoute("/scenarios/edit_scenario", editScenarioForm);

	router.addRoute("/scenarios/edit_site/:id", editSiteForm);
	router.addRoute("/scenarios/edit_site", editSiteForm);

	router.addRoute("/scenarios/:id", listScenarios);
	router.addRoute("/scenarios", listScenarios);
}