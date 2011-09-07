
var url = require('url');

module.exports = new Router();

function Router()
{
	this.routes = [];
}

Router.prototype.routeRequest = function(request, response)
{
	var len = this.routes.length;
	var route;
	
	var pathname = url.parse(request.url).pathname;
	
	for(var i = 0; i < len; ++i) {
		route = this.routes[i];
		
		if(this.tryRoute(pathname, request, response, route)) {
			return true;
		}
	}
	
	return false;
}

Router.prototype.tryRoute = function(pathname, request, response, route)
{
	var match = pathname.match(route.regexp);
	if(match != null) {
		var params = [];
		for(var j = 1; j < match.length; j++) {
			params[j] = match[j];
		}
		for(var j = 0; j < route.keys.length; j++) {
			var key = route.keys[j];
			params[key.name] = match[j+1];
		}
		
		try {
			route.func(request, response, params);
		} catch (err) {
			response.writeHead(200);
			response.write("Exception: " + err.toString());
			response.write(err.stack);
			response.end();
		}
		
		return true;
	}
	else {
		return false;
	}
}

Router.prototype.addRoute = function(path, func)
{
	var keys = [];
	var regexp = this.normalize(path, keys, false, false);
	
	var route = { "regexp": regexp, "keys": keys, "func": func };
	this.routes.push(route);
}

Router.prototype.normalize = function(path, keys, sensitive, strict)
{
  if (path instanceof RegExp) return path;
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}