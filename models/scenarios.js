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
	}
}

