(function() {
  // Not relevant for Node
  if (typeof module !== 'undefined' && module.exports) {
    return;
  }

  var util = this.Schema.util;

  /**
   * @param  string clientId
   * @param  string publicKey
   * @param  object options
   */
  var Client = (this.Schema.Client = function(publicKey, options) {
    if (typeof publicKey === 'object') {
      options = publicKey;
      publicKey = undefined;
    } else {
      options = options || {};
    }
    this.options = {
      publicKey: publicKey || options.publicKey || this.Schema.publicKey,
      hostUrl: options.hostUrl || this.Schema.publicUrl,
      timeout: options.timeout || 15000,
      version: options.version,
      session: options.session,
      api: options.api,
    };
  });

  /**
   * Execute a client request using JSONP
   *
   * @param  string method
   * @param  string url
   * @param  mixed data
   * @param  function callback
   */
  Client.prototype.request = function(method, url, data, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = null;
    }

    // TODO: implement $cached

    var requestId = Client.generateRequestId();

    url = url && url.toString ? url.toString() : '';
    data = {
      $jsonp: {
        method: method,
        callback: 'Schema.Client.response' + requestId,
      },
      $data: data,
      $key: this.options.publicKey,
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      this.options.hostUrl + '/' + url.replace(/^\//, '') + '?' + Client.serializeData(data);

    var self = this;
    var errorTimeout = setTimeout(function() {
      Schema.Client['response' + requestId]({
        $error: 'Request timed out after ' + self.options.timeout / 1000 + ' seconds',
        $status: 500,
      });
    }, self.options.timeout);

    Schema.Client['response' + requestId] = function(response) {
      clearTimeout(errorTimeout);
      self.response(method, url, response, callback);
      delete Schema.Client['response' + requestId];
      script.parentNode.removeChild(script);
    };

    document.getElementsByTagName('head')[0].appendChild(script);
  };

  /**
   * Client response handler
   *
   * @param  string method
   * @param  string url
   * @param  mixed result
   * @param  function callback
   */
  Client.prototype.response = function(method, url, result, callback) {
    var actualResult = null;

    if (result && result.$data && typeof result.$data === 'object') {
      actualResult = Client.createResource(result.$url, result, this);
    } else {
      actualResult = result.$data;
    }
    return callback && callback.call(this, actualResult, result);
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
    window.__schema_client_request_id = window.__schema_client_request_id || 0;
    window.__schema_client_request_id++;
    return window.__schema_client_request_id;
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
        if (rbracket.test(key)) {
          // Treat each array item as a scalar.
          add(key, v);
        } else {
          // Item is non-scalar (array or object), encode its numeric index.
          buildParams(key + '[' + (typeof v === 'object' && v != null ? i : '') + ']', v, add);
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
  }

  /**
   * Client create/init helper
   *
   * @param  string publicKey
   * @param  object options
   * @return Client
   */
  Client.create = function(publicKey, options) {
    return new Client(publicKey, options);
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
}.call(this));
