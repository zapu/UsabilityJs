(function(){
	function sendPayload(obj) {
		try {
			var str = JSON.stringify(obj);

			var client = new XMLHttpRequest();
			client.open("POST", "/__ujs_callback", false);
			client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
			client.send(str);
			if(client.status == 200) 
			{
				var resp = client.responseText;
				return JSON.parse(resp);
			}
		} catch (err) {
			console.log("Error: " + err);
		}

		return null;
	}

	if(typeof console == 'undefined') {
		console = {log: function(a){}};
	}

	document.addEventListener( "DOMContentLoaded", function() {
		var pageLoaded = sendPayload({action: "PageLoadedAction", requestId: __ujs_request_id});
		__ujs_page_id = pageLoaded.pageId;

		console.log("inject.js reporting in " + __ujs_request_id + " " + __ujs_page_id);

		alert(__ujs_page_id);
	}, false);
})();