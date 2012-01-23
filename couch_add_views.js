var cradle = require("cradle");
var config = require("./config");

var conn = new cradle.Connection(
	config.couch_address, config.couch_port, 
	{
		cache: false,
		raw: false,
	}
);

var db = conn.database(config.couch_db);

db.exists(function(err, exists) {
	if(err) {
		console.log('db.exists error', err);
	} else if(!exists) {
		db.create(function(err, res) {
			addViews();
		});
	}
});

function addViews() { 
	db.save('_design/test', {
		scenarios: {
			map: function(doc) {
				if(doc.type == "scenario") {
					emit(doc._id, doc);
				}
			},
		},

		sites: {
			map: function(doc) { 
				if(doc.type == "site") {
					emit(doc._id, doc); 
				}
			}
		},

		sites_with_scenarios: {
			map: function(doc) {
				if(doc.type == "site") {
					emit([doc._id, 0], doc);
				} else if(doc.type == "scenario") { 
					emit([doc.site_id, 1], doc); 
				} 
			}
		},

		reports: {
			map: function(doc) {
				if(doc.type == "report") {
					emit(doc._id, doc);
				}
			}
		}
		}, 
		function(err, res) {
			if(err) {
				console.log("addviews error", err);
			} else {
				console.log("Views added.");
			}
		});
}