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

	function addScenarioBar()
	{
		var div = document.createElement('div');
		div.style.fontSize = "14px";
		div.style.fontWeight = "bold";
		div.style.textAlign = "center";
		//div.style.position = "fixed";
		div.style.left = 0;
		div.style.top = 0;
		div.style.width = "80%";
		div.style.zIndex = 100;
		div.style.backgroundColor = "white";

		div.innerHTML = "<h1>Scenario " + __ujs_scenario.id + " \"" + __ujs_scenario.name + "\"</h1>";
		document.body.insertBefore(div, document.body.firstChild);

		console.log("added scenario bar... did it work?");
	}

	function getXPath(node, path) {
		path = path || [];
		if(node.parentNode) {
			path = getXPath(node.parentNode, path);
		}

		if(node.previousSibling) {
			var count = 1;
			var sibling = node.previousSibling
			do {
				if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {count++;}
					sibling = sibling.previousSibling;
			} while(sibling);
			if(count == 1) {count = null;}
		} else if(node.nextSibling) {
			var sibling = node.nextSibling;
			do {
				if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
					var count = 1;
					sibling = null;
				} else {
					var count = null;
					sibling = sibling.previousSibling;
				}
			} while(sibling);
		}

		if(node.nodeType == 1) {
			path.push(node.nodeName.toLowerCase() + (node.id ? "[@id='"+node.id+"']" : count > 0 ? "["+count+"]" : ''));
		}
		return path;
	};

	function serializeElement(element)
	{
		var obj = {
			id: element.id,
			tagName: element.tagName,
			str: element.toString(),
			XPath: getXPath(element),
		}

		return obj;
	}

	document.addEventListener('click', function(e) {
		var target = e.target || e.originalTarget;
		
		if(target instanceof HTMLAnchorElement) {
			var payload = {
				action: "ElementClickedAction",
				pageId: __ujs_page_id,
				element: serializeElement(target),
			};

			sendPayload(payload);
		}
	}, true);

	document.addEventListener('focus', function(e) {
		var target = e.target || e.originalTarget;

		if(target instanceof HTMLInputElement) {
			var payload = {
				action: "ElementFocusedAction",
				pageId: __ujs_page_id,
				element: serializeElement(target),
			};

			sendPayload(payload);
		}
	}, true);

	document.addEventListener('blur', function(e) {
		var target = e.target || e.originalTarget;

		if(target instanceof HTMLInputElement) {
			if(target._sentValue == undefined || target.value != target._sentValue) {
				var payload = {
					action: "InputValueChangedAction",
					pageId: __ujs_page_id,
					element: serializeElement(target),
					value: target.value,
				};

				sendPayload(payload);
				target._sentValue = target.value;
			}
		}

		if(target instanceof HTMLInputElement) {
			var payload = {
				action: "ElementBlurredAction",
				pageId: __ujs_page_id,
				element: serializeElement(target),
			};

			sendPayload(payload);
		}
	}, true);
})();