var mysql = require("mysql");

var DATABASE = "usability";

var client = mysql.createClient(
	{ host: "192.168.0.185", user: "zapu", password: "zapu"}
);

client.query("USE " + DATABASE);

console.log("looks like mysql is all set...");

module.exports = client;