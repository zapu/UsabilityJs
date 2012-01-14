var formidable = require("formidable");

var router = require("../router");
var templates = require("../templates");
var scenariosModel = require("../models/scenarios");
var testReportsModel = require("../models/testreports");

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

	testReportsModel.getAllReports(function(reports){
	scenariosModel.getSites(function(sites){
	scenariosModel.getAllScenarios(function(scenarios){
		var siteMap = {};
		var scenarioMap = {};

		var reportObjects = [];

		sites.forEach(function(site){
			siteMap[site._id] = site;

			site.scenarios = [];
			site.reports = [];
		});

		scenarios.forEach(function(scenario){
			scenarioMap[scenario._id] = scenario;

			var site = siteMap[scenario.site_id];
			scenario.site = site;
			scenario.reports = [];
			site.scenarios.push(scenario);
		});

		reports.forEach(function(report){
			var scenario = scenarioMap[report.scenario_id];

			if(scenario != null) {
				report.scenario = scenario;
				scenario.reports.push(report);
				scenario.site.reports.push(report);
			}

			var realReport = testManager.unserializeReport(report);
			realReport.scenario = scenario;
			reportObjects.push(realReport);
		});

		var viewParams = {
			sites: sites,
			scenarios: scenarios,
			reports: reports,
			activeTests: activeTests,
		};

		response.writeHead(200);
		response.end(templates.render("views/tests/testlist.ejs", viewParams));
	});
	}); //lol
	});
}

function showActiveTest(request, response, params)
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

function endTest(request, response, params)
{
	response.writeHead(200);
	
	var testId = params["uuid"];
	var test = testManager.testMap[testId];
	if(test == null) {
		response.write("no such test");
		response.end();
		return;
	}

	var viewParams = {
		test: test,
	};

	var text = templates.render("views/tests/end_test.ejs", viewParams);
	response.end(text);
}

function endTestPost(request, response, params)
{
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		response.writeHead(200);

		console.log(fields);
		
		var testId = fields["uuid"];
		var test = testManager.testMap[testId];
		if(test == null) {
			response.write("no such test");
			response.end();
			return;
		}

		var success = (fields["action"] == "success");
		var feedback = fields["feedback"];

		test.feedback = feedback;
		testManager.saveAndRemoveTest(test, success, function(res){
			response.end(JSON.stringify(res));
		});
	});
}

function showTestReport(request, response, params)
{
	testReportsModel.getReportById(params["id"], function(doc){
		if(doc == null) {
			response.writeHead(404);
			response.end("no such test report");
			return;
		}

		scenariosModel.getScenarioById(doc.scenario_id, function(scenario) {		
		scenariosModel.getSiteById(scenario.site_id, function(site) {	
			scenario.site = site;
			var testReport = testManager.unserializeReport(doc);
			testReport.scenario = scenario;

			response.writeHead(200);
			var viewParams = {
				test: testReport,
			};

			var text = templates.render("views/tests/show_test.ejs", viewParams);
			response.end(text);
		});
		});
	});
}

module.exports.install = function(_testManager)
{
	testManager = _testManager;

	router.addRoute("/tests/begintest/:id", beginTest);
	router.addRoute("/tests/begin_new_test", beginNewTestPost);
	router.addRoute("/tests/show_test/:uuid", showActiveTest);

	router.addRoute("/tests/show_report/:id", showTestReport);

	router.addRoute("/tests/end_test/:uuid", endTest);
	router.addRoute("/tests/end_test_post", endTestPost);

	router.addRoute("/tests", listTests);
}