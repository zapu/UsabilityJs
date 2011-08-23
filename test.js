var http = require('http');
var router = require('router');


var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Hello Http !? holy shit bro wtf!ss');
});

server.listen(8080);