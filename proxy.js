var http = require("http");
var url = require("url");
var Cookies = require("./cookies");

var testManager = require("./testing/manager");

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

function getContentType(headers)
{
	var contentType = null;
	for(var key in headers) {
		if(key.toLowerCase() == "content-type") {
			contentType = headers[key];
			break;
		}
	}

	if(contentType == null)
		return null;

	var content_type_params = contentType.split(";");

	var result = {type: content_type_params[0], params: {}};
	for(var i = 1; i < content_type_params.length; i++) {
		var keyval = content_type_params[i].split("=");
		result.params[keyval[0].toLowerCase().trim()] = keyval[1];
	}

	return result;
}

function injectCookies(test, test_cookie, response)
{
	var responseCookies = new Cookies(null, response);
	if(test != null) {
		//Generate and inject page token
		responseCookies.set("__ujs_cookie", test.uuid);
	} else if(test_cookie != null) {
		//Remove cookie if there is no such test.
		responseCookies.set("__ujs_cookie", "", {"expires": 0});
	}
}

function handleProxyRequest(request, response)
{
	var host_parts = request.headers.host.split(";");
	var host = host_parts[0];
	var port = host_parts[1] || 80;

	var url_parts = url.parse(request.url, true);

	var requestOptions = {
		host: host,
		port: port,
		path: url_parts.pathname + url_parts.search,
		method: request.method,
		headers: request.headers, //TODO: strip some headers?
	};

	var request_cookies = new Cookies(request, null);

	var new_test_token = url_parts.query["__usj_token"]; //Token in url when redirected for new test
	var test_cookie = request_cookies.get("__usj_cookie"); //Cookie for ongoing test

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
		var content_type = getContentType(proxyResponse.headers);
		var text = false;

		//Check if this is text type so we can use utf-8
		if(content_type != null && content_type.type.split("/")[0] == "text") {
			text = true;
		}

		proxyResponse.on('error', function(e) {
			console.log("proxy error " + e);
			return;
		});

		if(text) {
			proxyResponse.setEncoding('utf8');
			//Handle response as string
			var data = "";
			
			proxyResponse.on('data', function(chunk){
				data += chunk;		
			});

			proxyResponse.on('end', function(){
				injectCookies(test, test_cookie, proxyResponse);

				//Set content type to utf8 because thats what we are using
				console.log(content_type);

				if(content_type.params["charset"] != "utf-8") {
					content_type.params["charset"] = "utf-8";
					proxyResponse.headers["Content-Type"] = content_type.type;
					for(var param in content_type.params) {
						proxyResponse.headers["Content-Type"] += ";" + param + "=" + content_type.params[param];
					}
					console.log(content_type);
					console.log("new content type " + proxyResponse.headers["Content-Type"]);
				}

				if(test) {
					test.proxyHit(content_type, data);
				}

				console.log(data);

				response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
				if(proxyResponse.statusCode != 304) { //not modified
					response.write(data, 'utf8');
				}
				response.end();
			});
		} else {
			//Handle Buffers which will need to be glued
			var chunks = [];	

			proxyResponse.on("data", function(chunk){
				chunks.push(chunk);
			});

			proxyResponse.on("end", function(){
				var buffer = GlueBuffers(chunks);

				injectCookies(test, test_cookie, proxyResponse);
				
				if(test) {
					test.proxyHit(content_type, buffer);
				}

				response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
				if(proxyResponse.statusCode != 304) { //not modified
					response.write(buffer);
				}
				response.end();
			});
		}
	});

	proxyRequest.on('error', function(e) {
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
}

var proxyServer = http.createServer(handleProxyRequest);


proxyServer.listen(8081);