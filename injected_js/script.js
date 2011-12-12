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
		addScenarioBar();
	}, false);


	function anchor_AddEventHandler(type, listener, useCapture)
	{
		if(type == 'click') {
			//we are hijacking that event
			HTMLAnchorElement.prototype.realAddEventHandler.call(this, type, function(element) {
				anchorEventListener(element);
				listener(element);
			}, useCapture);
		} else {
			HTMLAnchorElement.prototype.realAddEventHandler.call(this, type, listener, useCapture);
		}
	}

	/* Prototype overriding */
	function overridePrototypes()
	{
		return;
		HTMLAnchorElement.prototype.realAddEventHandler = HTMLAnchorElement.prototype.addEventHandler;
		HTMLAnchorElement.prototype.addEventHandler = anchor_AddEventHandler;
		console.log(HTMLAnchorElement.prototype);

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
		return;
		var anchors = document.getElementsByTagName('a');
		for(var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			anchor.addEventHandler('click', anchorEventListener, false);
		}
	}

	function addScenarioBar()
	{
		var div = document.createElement('div');
		div.style.fontSize = "14px";
		div.style.fontWeight = "bold";
		div.style.textAlign = "center";
		div.style.position = "fixed";
		div.style.left = 0;
		div.style.top = 0;
		div.style.width = "80%";
		div.style.zIndex = 100;
		div.style.backgroundColor = "white";

		div.innerHTML = "<h1>Scenario " + __ujs_scenario.id + " \"" + __ujs_scenario.name + "\"</h1>";
		document.body.insertBefore(div, document.body.firstChild);

		console.log("added scenario bar... did it work?");
	}

	//mess with prototypes right away
	overridePrototypes();
})();