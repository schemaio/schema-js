/**
 * Record
 */
(function() {

var util = this.Schema.util;
var Resource = this.Schema.Resource;

/**
 * Record constructor
 *
 * @param  string url
 * @param  mixed result
 * @param  Client client
 * @param  Collection Collection
 */
var Record = this.Schema.Record = function(url, result, client, collection) {

    Resource.call(this, url, result, client);

    if (this.$links) {
        this.__initLinks(this.$links);
    }

    this.collection = collection;
};

util.inherits(Record, Resource);

/**
 * Initialize record links
 *
 * @param  links
 */
Record.prototype.__initLinks = function(links) {

    var self = this;
    for (var key in links) {
        if (!links.hasOwnProperty(key)) {
            continue;
        }
        (function(res, key) {
            var url = res.__linkUrl(key);
            // record.link(...)
            res[key] = function(callback) {
                if (typeof callback !== 'function') return;
                res.__client.get(url, null, callback);
                return this;
            };
            // record.link.each(...)
            res[key].each = function(callback, then) {
                if (typeof callback !== 'function') return;
                res[key](function(result) {
                    if (result && result.results) {
                        for (var i = 0; i < result.results.length; i++) {
                            callback(result.results[i]);
                        }
                    } else {
                        callback(result);
                    }
                    if (typeof then === 'function') {
                        then(result);
                    }
                });
            };
            // record.link.get(...)
            res[key].get = self.__linkRequest.bind(self, 'get', url);
            // record.link.put(...)
            res[key].put = self.__linkRequest.bind(self, 'put', url);
            // record.link.post(...)
            res[key].post = self.__linkRequest.bind(self, 'post', url);
            // record.link.delete(...)
            res[key].post = self.__linkRequest.bind(self, 'delete', url);
            // api.put(record.link, ...)
            res[key].toString = function() {
                return url;
            };
        }(this, key));
    }
};

/**
 * Build a link url for client request
 *
 * @param  string field
 * @return string
 */
Record.prototype.__linkRequest = function(method, url, relUrl, relData, callback) {

    if (typeof relUrl === 'function') {
        callback = relUrl;
        relUrl = null;
    } else if (typeof relData === 'function') {
        callback = relData;
        relData = null;
    }
    if (typeof relUrl === 'object') {
        relData = relUrl;
        relUrl = null;
        if (typeof relData === 'function') {
            callback = relData;
            relData = null;
        }
    }
    if (typeof callback !== 'function') return;
    if (relUrl) {
        url = url + '/' + relUrl.replace(/^\//, '');
    }
    return this.__client[method](url, relData, callback);
};

/**
 * Build a link url for client request
 *
 * @param  string field
 * @return string
 */
Record.prototype.__linkUrl = function(field) {

    var url = this.__url;
    var qpos = this.__url.indexOf('?');
    if (qpos !== -1) {
        url = url.substring(0, qpos);
    }
    return url.replace(/\/$/, '') + '/' + field;
};

/**
 * Record as inspected
 *
 * @return object
 */
Record.prototype.inspect = function() {

    var props = this.toObject();
    if (this.$links) {
        if (!this.collection) {
            props.$links = this.$links;
        }
    }
    return util.inspect(props);
};

// Exports
if (typeof exports !== 'undefined') {
    exports.Record = this.Schema.Record;
}

}).call(this);