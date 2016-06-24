var BASE_PATH = '/v1';
var PARAM_REGEX = /\{([^\}]+)+\}/g;

var resource = module.exports;

/**
 * Perform request with client scope
 *
 * @param  object scope
 * @param  string url
 * @param  object data
 * @param  function callback
 * @return Promise
 */
resource.request = function(method, scope, url, data, callback) {
  url = BASE_PATH + url;
  return scope.client[method](url, data, callback);
};

/**
 * GET request helper
 */
resource.get = function(scope, url, data, callback) {
  return resource.request('get', scope, url, data, callback);
};

/**
 * PUT request helper
 */
resource.put = function(scope, url, data, callback) {
  return resource.request('put', scope, url, data, callback);
};

/**
 * POST request helper
 */
resource.post = function(scope, url, data, callback) {
  return resource.request('post', scope, url, data, callback);
};

/**
 * DELETE request helper
 */
resource.delete = function(scope, url, data, callback) {
  return resource.request('delete', scope, url, data, callback);
};

/**
 * Define a chainable method
 *
 * @param  string|array method
 * @param  string url
 * @param  array paramArgs
 * @param  string name
 */
resource.method = function(method, url, paramArgs, name, chainable) {
  if (method instanceof Array) {
    args = method;
    name = args[0];
    method = args[1];
    paramArgs = args[0];
  }

  url = BASE_PATH + url;

  return function() {
    var params = resource.paramsFromArguments(arguments, paramArgs, name || method, this.root.__data);

    var relUrl = url;

    // Cancel previous request when set
    clearTimeout(this.root.__timeout);

    if (!chainable) {
      return this.client[method](relUrl, params.data, params.callback);
    }

    if (PARAM_REGEX.test(relUrl)) {
      var matches;
      while (matches = PARAM_REGEX.exec(relUrl)) {
        var match = matches[0];
        var key = matches[1];
        var value = params.data[key];
        if (typeof value === 'string') {
          value = value.replace(/\//g, '');
        }
        relUrl.replace(match, value);
        delete params.data[key];
      }
    }
    debugger;


    // Cancel previous request
    clearTimeout(this.root.__timeout);

    var timeout;
    var self = this;
    var promise = this.root.__promise = new Promise(function(resolve, reject) {
      timeout = setTimeout(function() {
        delete self.root.__data;
        debugger;
        self.client[method](relUrl, params.data, params.callback)
          .then(resolve)
          .catch(reject);
      }, 1);
    });

    this.root.__promise = promise;
    this.root.__data = params.data;
    this.root.__timeout = timeout;

    var keys = Object.keys(this);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (promise[key] === undefined) {
        promise[key] = this[key];
      }
    }

    return promise;
  };
};

/**
 * Define methods for an API model
 *
 * @param  string model
 * @param  object methods
 * @param  object obj
 * @return object
 */
resource.defineMethods = function(url, methods, obj) {
  var obj = obj || {};
  var keys = Object.keys(methods);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var args = methods[key];
    var name = url
      .replace(/^\//, '')
      .replace(/\/\{[^\}]+\}/g, '')
      .replace('/', '.')
      + '.' + key;
    var chainable = (key === 'get');
    obj[key] = resource.method(args[0], args[1], args[2], name, chainable);
  }

  return obj;
};

/**
 * Define standard methods for an API model
 *
 * @param  string baseUrl
 * @param  object methods
 * @return object
 */
resource.defineModel = function(url, methods) {
  url = '/' + url.replace(/^\//, '');

  var params = [];
  if (PARAM_REGEX.test(url)) {
    var matches;
    while (matches = PARAM_REGEX.exec(url)) {
      params.push(matches[1]);
    }
  }

  var urlWithId = url + '/{id}';
  var paramsWithId = params.concat([ 'id' ]);

  var obj = resource.defineMethods(url, {
    list: [
      'get', url, params
    ],
    get: [
      'get', urlWithId, paramsWithId
    ],
    create: [
      'post', url, params
    ],
    post: [
      'post', url, params
    ],
    update: [
      'put', urlWithId, paramsWithId
    ],
    put: [
      'put', urlWithId, paramsWithId
    ],
    delete: [
      'delete', urlWithId, paramsWithId
    ]
  });
  if (methods) {
    obj = resource.defineMethods(url, methods, obj);
  }
  return obj;
};

/**
 * Extract positional params from method arguments
 *
 * @param  array args
 * @param  array params
 * @return object
 */
resource.paramsFromArguments = function(args, params, methodName, rootData) {
  var data;
  rootData = rootData || {};

  if (params && params.length) {
    var paramData = {};
    var paramLength = 0;

    // Data from params
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      var arg = args[i];
      if (typeof param === 'string') {
        var paramParts = param.split(':');
        param = params[i] = {
          key: paramParts[0]
        };
        if (paramParts[1]) {
          param.type = paramParts.split('|');
        }
      }
      param.type = param.type || 'string|number';
      if (param.type.indexOf(typeof arg) >= 0) {
        paramData[param.key] = arg;
        paramLength++;
      } else if (param.default !== undefined) {
        paramData[param.key] = param.default;
      }
    }

    // Add data
    data = args[paramLength];
    if (!data || typeof data !== 'object') {
      data = {};
    }
    var missingKeys = [];
    for (var i = 0; i < params.length; i++) {
      var key = params[i].key;
      paramData[key] = paramData[key] || rootData[key];
      if (paramData[key] !== undefined) {
        data[key] = paramData[key];
      } else if (data[key] === null || data[key] === undefined) {
        if (params[i].default === undefined) {
          missingKeys.push(key);
        }
      }
    }

    // Error if missing keys
    if (missingKeys.length) {
      methodName = methodName || args.callee.name;
      debugger;
      var message = 'Call to `' + methodName + '` missing one or more arguments (';
      for (var i = 0; i < params.length; i++) {
        message += params[i].key;
        if (params.length > i + 1) {
          message += ', ';
        }
      }
      message += ')';
      throw new Error(message);
    }

  } else {
    // Data as object
    if (args[0] && typeof args[0] === 'object') {
      data = args[0];
    }
  }

  // Callback as function
  var callback;
  if (typeof args[args.length - 1] === 'function') {
    callback = args[args.length - 1];
  }

  return {
    data: data,
    callback: callback
  };
};
