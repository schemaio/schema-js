(function() {
  var util = this.Schema.util;

  /**
   * Resource constructor
   *
   * @param  string url
   * @param  mixed result
   * @param  Client client
   */
  var Resource = (this.Schema.Resource = function(url, result, client) {
    this.__url = url;
    this.__client = client;
    this.__data = null;

    if (result) {
      if (result.$links) {
        this.$links = Resource.$links[url] = result.$links;
      } else if (Resource.$links[url]) {
        this.$links = Resource.$links[url];
      }
      if (result.$data) {
        this.__initData(result.$data);
      }
    }
  });

  /**
   * Resource links by url
   * @var object
   */
  Resource.$links = {};

  /**
   * Initialize resource data
   *
   * @param  object data
   */
  Resource.prototype.__initData = function(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    this.__data = data;
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!data.hasOwnProperty(key)) {
        continue;
      }
      this[key] = data[key];
    }
  };

  /**
   * Get raw resource data
   *
   * @return object
   */
  Resource.prototype.toObject = function() {
    var data = {};
    if (this.__data) {
      var keys = Object.keys(this.__data);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        data[key] = this.__data[key];
      }
    }
    return data;
  };

  /**
   * Get raw resource data
   *
   * @return object
   */
  Resource.prototype.toJSON = function() {
    return JSON.stringify(this.toObject());
  };

  /**
   * Resource as a string representing request url
   *
   * @return string
   */
  Resource.prototype.toString = function() {
    return this.__url;
  };

  /**
   * Resource as inspected
   *
   * @return object
   */
  Resource.prototype.inspect = function(depth) {
    var props = this.toObject();
    if (this.$links) {
      props.$links = this.$links;
    }
    return util.inspect(props, { depth: depth, colors: true });
  };

  // Exports
  if (typeof exports !== 'undefined') {
    exports.Resource = this.Schema.Resource;
  }
}.call(this));
