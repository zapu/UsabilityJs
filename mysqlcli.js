var mysql = require("mysql");

return;

var DATABASE = "usability";

var client = mysql.createClient(
	{ host: "192.168.0.185", user: "zapu", password: "zapu"}
);

client.query("USE " + DATABASE, function(err) {
	if(err) {
		console.log("Mysql error: " + err);
		throw err;
	} else {
		console.log("looks like mysql is all set...");
	}
});

module.exports = client;