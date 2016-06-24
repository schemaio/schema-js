var routers = {
  v1: require('./v1')
};

var api = module.exports;

/**
 * Create an API object bound to a client instance
 *
 * @param  Client client
 * @param  string path
 * @return object
 */
api.create = function(client, path) {
  var proto = this.getRouter(path);
  return api.bindMethods(client, proto);
};

/**
 * Create an API object bound to a client instance
 * and apply methods to a host object
 *
 * @param  object object
 * @param  Client client
 * @param  string path
 * @return object
 */
api.apply = function(object, client, path) {
  var proto = this.getRouter(path);
  api.bindMethods(client, proto, object);
};

/**
 * Get API router by name
 *
 * @param  string path
 * @return object
 */
api.getRouter = function(path) {
  if (routers[path]) {
    return routers[path];
  }
  throw new Error('Schema API version `' + path + '` does not exist.');
};

/**
 * Create an API bound to a client instance
 *
 * @param  Client client
 * @param  object proto
 * @param  object object (optional)
 * @return object
 */
api.bindMethods = function(client, proto, object) {
  object = object || {};
  object.root = object.root || object;
  object.client = client;

  for (var key in proto) {
    if (object[key] !== undefined) {
      continue;
    }
    if (typeof proto[key] === 'function') {
      object[key] = proto[key].bind(object);
    } else if (typeof proto[key] === 'object' && proto[key]) {
      // Recursive
      object[key] = { root: object.root };
      object[key] = api.bindMethods(client, proto[key], object[key]);
    }
  }

  object = api.bindGetBase(object);

  return object;
};

/**
 * Bind the 'get' method as a special base function
 *
 * @param  object object
 * @return object
 */
api.bindGetBase = function(object) {
  if (object && typeof object.get === 'function') {
    var funcObj = function() {
      return object.get.apply(object, arguments);
    };
    for (var key in object) {
      funcObj[key] = object[key];
    }
    object = funcObj;
  }
  return object;
};
