var couch = require("../couchprovider");

module.exports = 
{
	getAllReports: function(callback)
	{
		couch.db.get('_design/test/_view/reports', function(err, doc) {
			if(err) {
				throw err;
			}
			
			callback(doc);
		});
	},

	getReportById: function(id, callback)
	{
		couch.db.get('_design/test/_view/reports?key="' + id + '"', function(err, doc) {
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

	addTestReport: function(report, callback)
	{
		var obj = report.serialize();
		obj.type = "report";

		couch.db.save(obj, function(err, res){
			if(err) {
				throw err;
			}

			callback(res);
		});
	},
}

