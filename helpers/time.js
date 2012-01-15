module.exports = {
	formatTimeDuration: function(t)
	{
		var result = {
			totalms: t,
		};

		result.hours = t / 3600000 | 0;
		t = t % 3600000;
		result.minutes = t / 60000 | 0;
		t = t % 60000;
		result.seconds = t / 1000 | 0; 
		result.milliseconds = t % 1000;

		return result;
	}
}