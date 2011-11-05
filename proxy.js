var http = require("http");
var url = require("url");
var Cookies = require("./cookies");
var util = require("util");

var gzbz2 = require("gzbz2");

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

function getHeader(headers, name)
{
	var header = null;
	for(var key in headers) {
		if(key.toLowerCase() == name) {
			return headers[key];
		}
	}	

	return null;
}

function getContentType(headers)
{
	var contentType = getHeader(headers, "content-type");

	if(contentType == null)
		return {type: "", params: {}};

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

		//But check if such cookie existed first...
		//responseCookies.set("__ujs_cookie", "", {"expires": 0});
	}
}

function handleProxyRequest(request, response)
{
	var host_parts = request.headers.host.split(":");
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

	var new_test_token = url_parts.query["__ujs_token"]; //Token in url when redirected for new test
	var test_cookie = request_cookies.get("__ujs_cookie"); //Cookie for ongoing test

	//TODO: Clean ujs cookie from request so proxy is 
	//transparent (from target host point of view)?
	
	var test = null;
	
	if(new_test_token != null) {
		//Query token is "more important", because when tester starts next
		//test on same website, we have to replace old cookie by planting a new one
		
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
			response.end("Proxy error " + util.inspect(e));
			return;
		});

		//Handle Buffers which will need to be glued
		var chunks = [];	

		proxyResponse.on("data", function(chunk){
			chunks.push(chunk);
		});

		proxyResponse.on("end", function(){
			var buffer = GlueBuffers(chunks);

			var decodedBuffer;
			if(getHeader(proxyResponse.headers, "content-encoding") == "gzip") {
				var gzip = new gzbz2.Gunzip;
				gzip.init({encoding: "utf8"});
				decodedBuffer = gzip.inflate(buffer, "utf8");
				gzip.end();
			} else {
				decodedBuffer = buffer.toString("utf8")
			}

			injectCookies(test, test_cookie, proxyResponse);

			if(test) {
				test.proxyHit(content_type, requestOptions, buffer);
			}

			response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
			if(proxyResponse.statusCode != 304) { //if not "not modified" status
				response.write(buffer);
			}
			response.end();
		});
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