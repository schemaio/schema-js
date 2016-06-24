var Schema = require('../index');

var DEFAULT_HOST = 'https://api.schema.io';
var DEFAULT_VAULT = 'https://vault.schema.io';
var DEFAULT_TIMEOUT = 45000;
var DEFAULT_VERSION = '1';

/**
 * @param  string clientId
 * @param  string publicKey
 * @param  object params
 */
var Client = module.exports = function(clientId, publicKey, params) {
  params = params || {};

  if (clientId && typeof clientId === 'object') {
    params = clientId;
    clientId = undefined;
  } else if (publicKey && typeof publicKey === 'object') {
    params = publicKey;
    publicKey = undefined;
    if (typeof clientId === 'string' && typeof publicKey !== 'string') {
      publicKey = clientId;
      clientId = undefined;
    }
  } else if (clientId && !publicKey) {
    publicKey = clientId;
    clientId = undefined;
  }

  if (params.session === undefined) {
    params.session = Schema.util.getSessionId();
  }

  this.params = {
    clientId: params.clientId || clientId, // Not used by public client
    publicKey: params.publicKey || publicKey,
    host: params.host || Client.defaults.host,
    timeout: params.timeout || Client.defaults.timeout,
    version: params.version || Client.defaults.version,
    versionPath: 'v' + (params.version || Client.defaults.version),
    session: params.session
  };

  if (!this.params.publicKey) {
    throw new Error('Schema Client requires `publicKey` to initialize.'
      + ' For example: new Schema.setPublicKey(\'pk_...\');');
  } else if (this.params.publicKey.indexOf('pk_') !== 0) {
    throw new Error('The key you provided is not a public key.'
      + ' It should begin with \'pk_\'.'
      + ' If you are trying to authenticate with a secret key,'
      + ' then use `Schema.setClientKey(clientId, secretKey)` instead.');
  }

  Schema.api.apply(this, this, this.params.versionPath);
};

// Defaults to be modified
Client.defaults = {
  host: DEFAULT_HOST,
  vault: DEFAULT_VAULT,
  timeout: DEFAULT_TIMEOUT,
  version: DEFAULT_VERSION
};

// Indicate public
Client.public = true;

/**
 * Execute a client request using JSONP
 *
 * @param  string method
 * @param  string url
 * @param  mixed data
 * @param  function callback
 * @return Promise
 */
Client.prototype.request = function(method, url, data, callback) {
  if (typeof data === 'function') {
    callback = data;
    data = null;
  }


  url = (url && url.toString) ? url.toString() : '';

  // Resolve data as promised
  var promises = Schema.util.promisifyData(data);
  if (promises.length) {
    return Promise.all(promises).bind(this).then(function() {
      this.request(method, url, data, callback);
    });
  }

  // TODO: implement $cached

  // TODO: move this into a Connection class
  if (this._supportsWS) {
    return this.requestWS(method, url, data, callback);
  } else if (this._supportsCORS) {
    return this.requestCORS(method, url, data, callback);
  } else if (this._supportsJSONP) {
    return this.requestJSONP(method, url, data, callback);
  }

  this.detectRequestSupport();
  return this.request.apply(this, arguments);
};

/**
 * Perform a client request using JSONP
 *
 * @param  string method
 * @param  string url
 * @param  mixed data
 * @param  function callback
 * @return Promise
 */
Client.prototype.requestJSONP = function(method, url, data, callback) {
  data = {
    $jsonp: {
      method: method,
      callback: 'Schema.Client.' + responseCallbackId,
      data: JSON.stringify(data)
    },
    $key: this.params.publicKey
  };

  if (this.params.session) {
    data.$session = this.params.session;
  }

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = this.params.host
    + '/' + url.replace(/^\//, '')
    + '?' + Client.serializeData(data);

  var requestId = Client.generateRequestId();
  var responseCallbackId = 'response' + requestId;

  var self = this;

  return new Promise(function(resolve, reject) {
    var errorTimeout = setTimeout(function() {
      Client[responseCallbackId]({
        $error: 'Request timed out after '+(self.params.timeout/1000)+' seconds',
        $status: 500
      });
    }, self.params.timeout);

    Client[responseCallbackId] = function(response) {
      clearTimeout(errorTimeout);
      self.respond(method, url, response, function(err, data, response) {
        if (callback) {
          callback(err, data, response);
        }
        if (err) {
          reject(err);
        } else {
          resolve(data, response);
        }
      });
      delete Client[responseCallbackId];
      script.parentNode.removeChild(script);
    };

    document.getElementsByTagName("head")[0].appendChild(script);

  }).catch(function(err) {
    // Server did not respond withiin timeout
    throw err;
  });
};

/**
 * Perform a client request using CORS
 *
 * @param  string method
 * @param  string url
 * @param  mixed data
 * @param  function callback
 * @return Promise
 */
Client.prototype.requestCORS = function(method, url, data, callback) {
  var req = new XMLHttpRequest();
  var requestUrl = this.params.host + '/' + url.replace(/^\//, '');
  var requestData = {
    $data: data,
    $key: this.params.publicKey
  };

  if (this.params.session) {
    requestData.$session = this.params.session;
  }

  req.open(method, requestUrl, true);
  req.timeout = this.params.timeout;
  req.setRequestHeader('Content-type', 'application/json');

  var self = this;

  return new Promise(function(resolve, reject) {
    var responder = function(response) {
      self.respond(method, url, response, function(err, data, response) {
        if (callback) {
          callback(err, data, response);
        }
        if (err) {
          reject(err);
        } else {
          resolve(data, response);
        }
      });
    };

    req.ontimeout = function() {
      responder({
        $error: 'Request timed out after '+(self.params.timeout/1000)+' seconds',
        $status: 500
      });
    };

    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.responseText) {
          try {
            var result = JSON.parse(req.responseText);
            if (result && result.$error) {
              responder(result);
            } else {
              responder({
                $data: result,
                $status: req.status
              });
            }
          } catch (err) {
            responder({
              $error: 'Unable to parse response from server',
              $status: 500
            });
          }
        } else {
          responder({
            $error: 'Unhandled request error',
            $status: 500
          });
        }
      }
    };

    req.send(JSON.stringify(requestData));
  });
};

/**
 * Perform a client request using WebSocket
 *
 * @param  string method
 * @param  string url
 * @param  mixed data
 * @param  function callback
 * @return Promise
 */
Client.prototype.requestWS = function(method, url, data, callback) {
  var requestUrl = '/' + url.replace(/^\//, '');
  var requestHeaders = {
    $data: data,
    $key: this.params.publicKey
  };
  var requestArgs = [method, requestUrl, requestHeaders];

  if (this.params.session) {
    requestHeaders.$session = this.params.session;
  }

  this.__socketResponders = this.__socketResponders || [];

  var self = this;

  if (!this.__socket) {
    var WS = WebSocket || MozWebSocket;
    this.__socket = new WS(this.params.host.replace('http', 'ws'));

    this.__socket.onopen = function(e) {
      self.__socket.connected = true;
      self.sendWSRequest(self.__socket, requestArgs);
    };

    this.__socket.onmessage = function(e) {
      var responder = self.__socketResponders.shift();
      if (responder) {
        responder(e.data);
      }
    };

    this.__socket.onerror = function(e) {
      self.__socket.close();
    };

    this.__socket.onclose = function(e) {
      delete self.__socket;
    };
  }

  return new Promise(function(resolve, reject) {
    var responder = function(response) {
      try {
        response = JSON.parse(response);
      } catch (err) {
        response = {
          $error: 'Unable to parse response from server',
          $status: 500
        };
      }
      self.respond(method, url, response, function(err, data, response) {
        if (callback) {
          callback(err, data, response);
        }
        if (err) {
          reject(err);
        } else {
          resolve(data, response);
        }
      });
    };

    self.__socketResponders.push(responder);

    if (self.__socket.connected) {
      self.sendWSRequest(self.__socket, requestArgs);
    }
  });
};

/**
 * Send WS request when connected
 *
 * @param  WebSocket socket
 * @param  mixed data
 */
Client.prototype.sendWSRequest = function(socket, data, retries) {
  try {
    socket.send(JSON.stringify(data));
  } catch (err) {
    // Attempt to connect for [timeout] time
    if (retries >= (this.params.timeout / 500)) {
      throw new Error('Error: socket connection timeout');
    }
    retries = retries ? retries + 1 : 1;
    setTimeout(this.sendWSRequest.bind(this, socket, data, retries), 500);
  }
};

/**
 * Detect browser support for CORS vs JSONP
 *
 * @return void
 */
Client.prototype.detectRequestSupport = function() {
  if (WebSocket || MozWebSocket) {
    this._supportsWS = true;
  } else if (XMLHttpRequest && ('withCredentials' in new XMLHttpRequest())) {
    this._supportsCORS = true;
  } else {
    this._supportsJSONP = true;
  }
 };

/**
 * Client response handler
 *
 * @param  string method
 * @param  string url
 * @param  mixed response
 * @param  function callback
 */
Client.prototype.respond = function(method, url, response, callback) {
  var err = undefined;
  var data = undefined;

  if (response) {
    if (response.$error) {
      err = new Error(response.$error);
      err.$status = response.$status;
    }
    if (response.$data && (typeof response.$data === 'object')) {
      data = Client.createResource(response.$url || url, response, this);
    } else {
      data = response.$data;
    }
  } else {
    response = { $error: 'Empty response from server', $status: 500 };
    err = new Error(response.$error);
    err.status = response.$status;
  }
  return callback.call(this, err, data, response);
};

/**
 * GET a resource
 *
 * @param  string url
 * @param  mixed data
 * @param  function callback
 */
Client.prototype.get = function(url, data, callback) {
  return this.request('get', url, data, callback);
};

/**
 * PUT a resource
 *
 * @param  string url
 * @param  mixed data
 * @param  function callback
 */
Client.prototype.put = function(url, data, callback) {
  return this.request('put', url, data, callback);
};

/**
 * POST a resource
 *
 * @param  string url
 * @param  mixed data
 * @param  function callback
 */
Client.prototype.post = function(url, data, callback) {
  return this.request('post', url, data, callback);
};

/**
 * DELETE a resource
 *
 * @param  string url
 * @param  mixed data
 * @param  function callback
 */
Client.prototype.delete = function(url, data, callback) {
  return this.request('delete', url, data, callback);
};

/**
 * Generate a unique request ID for response callbacks
 *
 * @return number
 */
Client.generateRequestId = function() {
  Client.__request_id = Client.__request_id || 0;
  Client.__request_id++;
  return Client.__request_id;
};

/**
 * Serialize data into a query string
 * Mostly copied from jQuery.param
 *
 * @param  mixed data
 * @return string
 */
Client.serializeData = function(data) {
  var key;
  var s = [];
  var add = function(key, value) {
    // If value is a function, invoke it and return its value
    if (typeof value === 'function') {
      value = value();
    } else if (value == null) {
      value = '';
    }
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  };
  for (key in data) {
    buildParams(key, data[key], add);
  }
  return s.join('&').replace(' ', '+');
};
var rbracket = /\[\]$/;
function buildParams(key, obj, add) {
  var name;
  if (obj instanceof Array) {
    for (var i = 0; i < obj.length; i++) {
      if (rbracket.test(key) ) {
        // Treat each array item as a scalar.
        add(key, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(
          key + '[' + (typeof v === 'object' && v != null ? i : '') + ']',
          v,
          add
        );
      }
    }
  } else if (obj && typeof obj === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(key + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(key, obj);
  }
};

/**
 * Create a resource from result data
 *
 * @param  string url
 * @param  mixed result
 * @param  Client client
 * @return Resource
 */
Client.createResource = function(url, result, client) {
  if (result && result.$data && 'count' in result.$data && result.$data.results) {
    return new Schema.Collection(url, result, client);
  }
  return new Schema.Record(url, result, client);
};
