var http = require("http");

var server = http.createServer(function(request, response) {
	//console.log("Request " + request.method + " " + request.url);
	//console.log(request.headers);
	
	var requestOptions = {
		host: request.headers.host,
		port: 80,
		path: request.url,
		method: request.method,
	};
	
	console.log(requestOptions);
	
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
			
			response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
			response.write(buffer);
			response.end();
		});
	});
	
	proxyRequest.addListener('error', function(e) {
		console.log("Request error:");
		console.log(e);
	});
	
	request.addListener('data', function(chunk) {
		proxyRequest.write(chunk, 'utf8');
	});
	
	request.addListener('end', function() {
		proxyRequest.end();
	});
});

server.listen(8081);