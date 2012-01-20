var couch;

//Create database if it doesnt exist
try{
	couch = require("./couchprovider");
}catch(e) {
	if(e == "couchdb database does not exist") {
		couch.db.create();
	}
}

couch.db.save('_design/test', {
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
			console.log("error", err);
		} else {
			console.log("Views added.");
		}
	});