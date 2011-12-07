(function(){
	/* Function used to send javascript objects to host application */
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

	//Declare console in case there isn't one
	//Firebug declares its own, chrome should have one too?
	if(typeof console == 'undefined') {
		console = {log: function(a){}};
	}

	document.addEventListener( "DOMContentLoaded", function() {
		var pageLoaded = sendPayload({action: "PageLoadedAction", requestId: __ujs_request_id});
		__ujs_page_id = pageLoaded.pageId;

		console.log("inject.js reporting in " + __ujs_request_id + " " + __ujs_page_id);

		walkDOM();
	}, false);

	/* Prototype overriding */
	function overridePrototypes()
	{
		console.log("overriding prototypes");
	}

	function anchorEventListener(anchor)
	{
		var obj = {
			action: "ElementClickedAction",
			pageId: __ujs_page_id,
			element: "derp",
		}

		sendPayload(obj);
	}

	/* DOM walking */
	function walkDOM(element)
	{
		var anchors = document.getElementsByTagName('a');
		for(var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			anchor.addEventListener('click', anchorEventListener, false);
		}
	}

	//mess with prototypes right away
	overridePrototypes();
})();