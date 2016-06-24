var util = module.exports;

/**
 * Inheritance helper
 *
 * @param  object baseObj
 * @param  object superObj
 */
util.inherits = function(baseObj, superObj) {
  baseObj._super = superObj;
  var tempObj = function(){};
  tempObj.prototype = superObj.prototype;
  baseObj.prototype = new tempObj();
  baseObj.prototype.constructor = baseObj;
};

/**
 * Get a cookie value
 */
util.getCookie = function(name) {
  if (!process.browser) {
    global.document = global.document || { cookie: ''};
  }

  var nameEQ = name + '=';
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }
		if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
	}
	return null;
};

/**
 * Set a cookie value
 */
util.setCookie = function(name, value, expireDays) {
  if (!process.browser) {
    global.document = global.document || { cookie: ''}
  }

  var expires = '';
  if (expireDays) {
    var date = new Date();
    date.setTime(date.getTime() + (expireDays*24*60*60*1000));
    var expires = '; expires=' + date.toGMTString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
};

/**
 * Get the local sesison id
 * Generates one if it does not yet exist
 */
util.getSessionId = function() {
  var sessionId = util.getCookie('session');
  if (!sessionId) {
    sessionId = util.generateUUIDv4();
    util.setCookie('session', sessionId);
  }
  return sessionId;
};

/**
 * Generate UUID v4 (RFC 4122)
 */
util.generateUUIDv4 = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

/**
 * Resolve and return promises array from data
 * Only resolve top level object keys
 *
 * @param  object data
 * @return array
 */
util.promisifyData = function(data) {
  if (!data) {
    return [];
  }

  function thenResolvePromisedValue(data, key) {
    data[key].then(function(val) {
      data[key] = val;
    });
  }

  var promises = [];
  if (typeof data === 'object') {
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (data[key] && data[key].then) {
        promises.push(data[key]);
        thenResolvePromisedValue(data, key);
      }
    }
  } else if (data instanceof Array) {
    for (var i = 0; i < data.length; i++) {
      if (data[i] && data[i].then) {
        promises.push(data[i]);
        thenResolvePromisedValue(data, i);
      }
    }
  }

  return promises;
};

/**
 * Inspect a variable and output to console
 *
 * @param  mixed arg
 * @param  object options
 */
util.inspect = function(arg, options) {
	if (process.browser) {
		// Browser
		return console.log(arg);
  } else {
    // NodeJS
		return require('util').inspect(arg, options);
	}
};
