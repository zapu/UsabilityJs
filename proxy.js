var http = require("http");
var url = require("url");
var Cookies = require("./cookies");

var testManager = require("./testmanager");

function GlueBuffers(chunks)
{
	var bufferSize = 0;
	chunks.forEach(function(chunk) {
		bufferSize += chunk.length;
	});
	
	var buffer = new Buffer(bufferSize);
	var pos = 0;
	chunks.forEach(function(chunk) {
		chunk.copy(buffer, pos, 0);
		pos += chunk.length;
	});
	
	return buffer;
}

var proxyServer = http.createServer(function(request, response) {	
	
	var host = request.headers.host.split(':'); //the best solution is usually the easist one.

	var url_parts = url.parse(request.url, true);
		
	var requestOptions = {
		host: host[0],
		port: host[1] || 80,
		path: url_parts.pathname + url_parts.search,
		method: request.method,
		headers: request.headers, //TODO: Strip some headers?
	};

	var requestCookies = new Cookies(request, null);
		
	var new_test_token = url_parts.query["__ujs_token"];
	var test_cookie = requestCookies.get("__ujs_cookie");
	
	//TODO: Clean ujs cookie from request so proxy is 
	//transparent (from target host point of view)?
	
	var test = null;
	
	if(new_test_token != null) {
		//Query token is "more important", because when tester starts next
		//test on same website, the cookie stays.
		
		test = testManager.getTestByUUID(new_test_token);
	} else if(test_cookie != null) {
		test = testManager.getTestByUUID(test_cookie);
	}
	
	proxyRequest = http.request(requestOptions, function(proxyResponse) {		
		var chunks = []
		
		proxyResponse.addListener('data', function(chunk) {
			chunks.push(chunk);
		});
		
		proxyResponse.addListener('error', function(e) {
			console.log("Proxy response error:");
			console.log(e);
		});
		
		proxyResponse.addListener('end', function(e) {
			var buffer = GlueBuffers(chunks);
						
			//Manage cookies
			var responseCookies = new Cookies(null, proxyResponse);
			if(test != null) {
				//Generate and inject page token
				responseCookies.set("__ujs_cookie", test.uuid);
			
				test.pageVisited(request.url);
			} else if(test_cookie != null) {
				//Remove cookie if there is no such test.
				responseCookies.set("__ujs_cookie", "", {"expires": 0});
			}
			
			response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
			response.write(buffer);
			response.end();
		});
	});
	
	proxyRequest.addListener('error', function(e) {
		response.writeHead(500);
		response.write("Target server error");
		response.write(e.toString());
		response.end();
	});
	
	request.addListener('data', function(chunk) {
		proxyRequest.write(chunk, 'utf8');
	});
	
	request.addListener('end', function() {
		proxyRequest.end();
	});
});

proxyServer.listen(8081);