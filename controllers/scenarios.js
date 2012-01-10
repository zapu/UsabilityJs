
//Install routes
var router = require("../router");
var templates = require("../templates");
var scenariosModel = require("../models/scenarios");
var sitesModel = require("../models/sites");
var formidable = require("formidable");

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

function newScenarioForm(request, response, params)
{
	scenariosModel.getSiteById(params.id, function(site) {	
		if(site == null) {
			response.writeHead(404);
			response.end("<b>site not found.</b>");
		} else {
			var viewParams = {scenario: null, site: site};
			var text = templates.render("views/scenarios/edit_scenario.ejs", viewParams);

			response.writeHead(200);
			response.end(text);
		}
	});
}

function editScenarioPost(request, response, params)
{
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		if(error) {
			response.writeHead(500);
			response.end(JSON.stringify(error));
			return;
		}

		var scenario_id = fields["scenario_id"];

		var tasks = [];
		try {
			tasks = JSON.parse(fields["tasks"]);
			//remove empty strings from tasks
			for(var i = 0; i < tasks.length; i++) {
				if(tasks[i] == "") {
					tasks.splice(i, 1);
					i--;
				}
			}
		} catch (exception)	{
			
		}
		var scenario = {
			type: "scenario",
			name: fields["scenario_name"],
			description: fields["description"],
			address: fields["starting_url"],
			site_id: fields["site_id"],
			tasks: tasks,
		};
		
		if(scenario_id != null) {
			scenariosModel.updateScenario(scenario_id, scenario, function(result) {
				return showScenario(request, response, {id: scenario_id});
			});
		} else {
			scenariosModel.addScenario(scenario, function(result) {
				return showScenario(request, response, {id: result.id});
			});
		}
	});
}

function deleteScenarioForm(request, response, params)
{
	scenariosModel.getScenarioById(params["id"], function(scenario) {	
		if(scenario == null) {
			response.writeHead(404);
			response.end("<b>site not found.</b>");
		} else {
			var viewParams = {scenario: scenario};
			var text = templates.render("views/scenarios/delete_scenario.ejs", viewParams);

			response.writeHead(200);		
			response.end(text);
		}
	});
}

function deleteScenarioPost(request, response, params)
{
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		if(error) {
			response.writeHead(500);
			response.end(JSON.stringify(error));
			return;
		}

		var scenario_id = fields["scenario_id"];
		scenariosModel.getScenarioById(scenario_id, function(scenario) {
			if(scenario == null) {
				response.write(404);
				responee.end("scenario not found");
			}
			scenariosModel.removeScenario(scenario_id, function(res){
				return listScenarios(request, response, {id: scenario.site_id})
			});
		});
	});
}

function editSiteForm(request, response, params)
{
	var site_id = params.id;

	scenariosModel.getSiteById(site_id, function(site) {		
		if(site == null) {
			response.writeHead(404);
			response.end("<b>site not found.</b>");
		} else {
			var viewParams = {site: site};
			var text = templates.render("views/scenarios/edit_site.ejs", viewParams);

			response.writeHead(200);		
			response.end(text);
		}
	});
}

function newSiteForm(request, response, params)
{
	var viewParams = {site: null};
	var text = templates.render("views/scenarios/edit_site.ejs", viewParams);

	response.writeHead(200);
	response.end(text);
}

function editSitePost(request, response, params)
{
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		if(error) {
			response.writeHead(500);
			response.end(JSON.stringify(error));
			return;
		}

		var site_id = fields["site_id"];

		var site = {
			type: "site",
			name: fields["site_name"],
			url: fields["site_url"],
			description: fields["description"],
		};

		if(site_id != null) {
			scenariosModel.updateSite(site_id, site, function(result){
				return listScenarios(request, response, {id: site_id});
			});
		} else {
			scenariosModel.addSite(site, function(result){
				return listScenarios(request, response, {id: result.id});
			});
		}
	});
}

function deleteSiteForm(request, response, params)
{
	var site_id = params.id;

	scenariosModel.getSiteById(site_id, function(site) {		
		if(site == null) {
			response.writeHead(404);
			response.end("<b>site not found.</b>");
		} else {
			var viewParams = {site: site};
			var text = templates.render("views/scenarios/delete_site.ejs", viewParams);

			response.writeHead(200);		
			response.end(text);
		}
	});
}

function deleteSitePost(request, response, params)
{
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		if(error) {
			response.writeHead(500);
			response.end(JSON.stringify(error));
			return;
		}

		var site_id = fields["site_id"];

		scenariosModel.removeSite(site_id, function(res){
			return listScenarios(request, response, {});
		});
	});
}

module.exports.install = function(_testManager)
{
	router.addRoute("/scenarios/show/:id", showScenario);

	router.addRoute("/scenarios/edit_scenario/:id", editScenarioForm);
	router.addRoute("/scenarios/new_scenario/:id", newScenarioForm);
	router.addRoute("/scenarios/edit_scenario_post", editScenarioPost);

	router.addRoute("/scenarios/delete_scenario/:id", deleteScenarioForm);
	router.addRoute("/scenarios/delete_scenario_post", deleteScenarioPost);

	router.addRoute("/scenarios/edit_site/:id", editSiteForm);
	router.addRoute("/scenarios/new_site", newSiteForm);
	router.addRoute("/scenarios/edit_site_post", editSitePost);

	router.addRoute("/scenarios/delete_site/:id", deleteSiteForm);
	router.addRoute("/scenarios/delete_site_post", deleteSitePost);

	router.addRoute("/scenarios/:id", listScenarios);
	router.addRoute("/scenarios", listScenarios);
}