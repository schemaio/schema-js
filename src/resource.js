/**
 * Resource
 */
(function() {

var util = this.Schema.util;

/**
 * Resource constructor
 *
 * @param  string url
 * @param  mixed result
 * @param  Client client
 */
var Resource = this.Schema.Resource = function(url, result, client) {

    this.__url = url;
    this.__client = client;
    this.__fields = [];

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
};

/**
 * Resource links by url
 * @var object
 */
Resource.$links = {};

/**
 * Initialize resource data
 *
 * @param  mixed data
 */
Resource.prototype.__initData = function(data) {

    if (typeof data !== 'object') {
        return;
    }
    for (var key in data) {
        if (!data.hasOwnProperty(key)) {
            continue;
        }
        this[key] = data[key];
        this.__fields.push(key);
    }
};

/**
 * Get raw resource data
 *
 * @return object
 */
Resource.prototype.__getData = function() {

    var data = {};
    for(var i = 0; i < this.__fields.length; i++) {
        data[this.__fields[i]] = this[this.__fields[i]];
    }
    return data;
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
Resource.prototype.inspect = function() {
    var props = this.__getData();
    if (this.$links) {
        /*for (var field in this.$links) {
            props[field] = this[field]
        }*/
        props.$links = this.$links;
    }
    return util.inspect(props);
};


// Exports
if (typeof exports !== 'undefined') {
    exports.Resource = this.Schema.Resource;
}

}).call(this);
