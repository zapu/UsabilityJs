var cradle = require("cradle");
var config = require("./config");

var conn = new cradle.Connection(
	config.couch_address, config.couch_port, 
	{
		cache: true,
		raw: false,
	}
);

var db = conn.database(config.couch_db);

db.exists(function(err, exists) {
	if(err) {
		console.log('error', err);
	} else if(!exists) {
		throw new Exception("couchdb database does not exist");
	}
});

module.exports = {db: db};