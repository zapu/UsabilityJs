var couch = require("../couchprovider");

module.exports = 
{
	getAllSites: function(callback)
	{
		couch.db.get('_design/test/_view/sites', function(err, doc) {
			if(err) {
				throw err;
			}
			
			callback(doc);
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
	}
}

