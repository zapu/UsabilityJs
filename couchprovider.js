var cradle = require("cradle");

var conn = new cradle.Connection(
	//"http://192.168.248.128", 5984, 
	"http://192.168.248.131", 5984, 
	{
		cache: true,
		raw: false,
	}
);

var db = conn.database('usabilityjs');

db.exists(function(err, exists) {
	if(err) {
		console.log('error', err);
	} else if(!exists) {
		throw new Exception("couchdb database does not exist");
	}
});

module.exports = {db: db};