var formidable = require("formidable");

var router = require("../router");
var templates = require("../templates");
var scenariosModel = require("../models/scenarios");

var testManager = null;

function beginTest(request, response, params)
{
	var scenario_id = params["id"];
	
	scenariosModel.getScenarioById(scenario_id, function(scenario) {	
		if(scenario == null) {
			response.writeHead(404);
			response.end();
		} else {
			var viewParams = { scenario: scenario };
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

function listTests(request, response, params)
{
	var activeTests = []
	for (uid in testManager.testMap) {
		var test = testManager.testMap[uid];
		activeTests.push(test);
	}
	
	response.writeHead(200);
	response.end(templates.render("views/tests/testlist.ejs", {activeTests: activeTests}));
}

function showTest(request, response, params)
{
	response.writeHead(200);
	
	var testId = params["uuid"];
	var test = testManager.testMap[testId];
	if(test == null) {
		response.write("no such test");
		response.end();
		return;
	}
	
	var params = {test: test};
	
	var text = templates.render("views/tests/show_test.ejs", params);
	response.end(text);
}

module.exports.install = function(_testManager)
{
	testManager = _testManager;

	router.addRoute("/tests/begintest/:id", beginTest);
	router.addRoute("/tests/begin_new_test", beginNewTestPost);
	router.addRoute("/tests/show_test/:uuid", showTest);
	router.addRoute("/tests", listTests);
}