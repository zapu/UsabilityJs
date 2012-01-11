var couch = require("./couchprovider");

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
});