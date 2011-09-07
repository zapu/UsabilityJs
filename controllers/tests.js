var formidable = require("formidable");

var testManager = require("../testmanager");

//Install routes
var router = require("../router");
router.addRoute("/tests/begintest/:id", beginTest);
router.addRoute("/tests/begin_new_test", beginNewTestPost);

var templates = require("../templates");

var scenariosModel = require("../models/scenarios");

function beginTest(request, response, params)
{
	var scenario_id = parseInt(params["id"]);
	
	scenariosModel.getScenarioById(scenario_id, function(scenario) {	
		if(scenario == null) {
			
		} else {
			var viewParams = {
				id: scenario["id"],
				name: scenario["name"],
			};
			var text = templates.render("views/tests/new_test.ejs", viewParams);
			
			response.end(text);
		}
	});
}

function beginNewTestPost(request, response, params)
{
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		var scenario_id = fields["scenario_id"];
		console.log(fields);
		
		scenariosModel.getScenarioById(scenario_id, function(scenario) {
			if(scenario == null) {
				response.writeHead(200);
				response.end("Bad scenario id");
			} else {
				var test = testManager.beginNewTest(scenario);
				
				response.writeHead(302, {"Location": test.getStartingLocation()});
				console.log("Test " + test.uuid + " starts, redirecting to: " + test.getStartingLocation());
				response.end();
			}
		});
	});
}