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
	}
}

