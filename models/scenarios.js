var mysqlcli = require("../mysqlcli");

module.exports = 
{
	getAllScenarios: function(callback)
	{
		mysqlcli.query("SELECT * FROM `tests`", function(db_err, db_result, db_fields) {
			if(db_err) {
				throw db_err;
			}
			
			//no magic to result here
			
			callback(db_result);
		});
	},
	
	getScenarioById: function(id, callback)
	{
		mysqlcli.query("SELECT * FROM `tests` WHERE `id` = ?", [id], function(db_err, db_result, db_fields) {
			if(db_err) {
				throw db_err;
			}
			
			if(db_result.length == 0) {
				callback(null);
			} else {
				callback(db_result[0]);
			}
		});
	}
}

