var couch = require("../couchprovider");

module.exports = 
{
	getAllScenarios: function(callback)
	{
		couch.db.get('_design/test/_view/scenarios', function(err, doc) {
			if(err) {
				throw err;
			}
			
			callback(doc);
		});
	},
	
	getScenarioById: function(id, callback)
	{
		couch.db.get('_design/test/_view/scenarios?key="' + id + '"', function(err, doc) {
			if(err) {
				throw err;
			}

			if(doc.rows.length > 0) {
				callback(doc.rows[0].value);
			} else {
				callback(null);
			}
		});
	},

	getSiteById: function(id, callback)
	{
		couch.db.get('_design/test/_view/sites?key="' + id + '"', function(err, doc) {
			if(err) {
				throw err;
			}

			if(doc.rows.length > 0) {
				callback(doc.rows[0].value);
			} else {
				callback(null);
			}
		});
	},

	getSites: function(callback)
	{
		couch.db.get('_design/test/_view/sites', function(err, doc) {
			if(err) {
				throw err;
			}

			callback(doc);
		});
	},

	getSitesWithScenarios: function(callback)
	{
		couch.db.get('_design/test/_view/sites_with_scenarios', function(err, doc) {
			if(err) {
				throw err;
			}

			callback(doc);
		});
	},

	getScenariosWithSite: function(id, callback)
	{
		couch.db.get('_design/test/_view/sites_with_scenarios?startkey=["'+id+'"]&endkey=["'+id+'",2]', function(err, doc) {
			if(err) {
				throw err;
			}

			var site = { scenarios: [] };
			doc.forEach(function(element) {
				if(element.type == 'site') {
					for(var key in element) {
						site[key] = element[key];
					}
				} else {
					site.scenarios.push(element);
				}
			});

			if(site._id == undefined) {
				//we didn't got any result at all
				callback(null);
			} else {
				callback(site);
			}
		});
	},

	updateScenario: function(id, scenario, callback)
	{
		this.getScenarioById(id, function(current_scenario){
			if(current_scenario == null) {
				callback({ok: false, id: id}); //?
				return;
			}

			couch.db.save(id, current_scenario._rev, scenario, function(err, res){
				if(err) {
					throw err;
				} else {
					callback(res);
				}
			});
		});
	},

	addScenario: function(scenario, callback)
	{
		couch.db.save(scenario, function(err, res){
			if(err) {
				throw err;
			} else {
				callback(res);
			}
		});
	},

	removeScenario: function(id, callback)
	{
		this.getScenarioById(id, function(scenario){
			if(scenario == null) {
				callback({ok: false});
				return;
			}

			couch.db.remove(scenario._id, scenario._rev, function(err, res){
				if(err) {
					throw err;
				}
				
				callback(res);
			});
		});
	},

	updateSite: function(id, site, callback)
	{
		this.getSiteById(id, function(current_site){
			if(site == null) {
				callback(false);
				return;
			}

			couch.db.save(id, current_site._rev, site, function(err, res){
				if(err) {
					throw err;
				}

				callback(res);
			});
		});
	},
	
	addSite: function(site, callback)
	{
		couch.db.save(site, function(err, res){
			if(err) {
				throw err;
			}

			console.log(res);

			callback(res);
		});
	},

	removeSite: function(id, callback)
	{
		this.getSiteById(id, function(site){
			if(site == null) {
				callback({ok: false});
				return;
			}

			couch.db.remove(site._id, site._rev, function(err, res){
				if(err) {
					throw err;
				}

				callback(res);
			});
		});
	}
}

