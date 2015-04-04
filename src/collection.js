/**
 * Collection
 */
(function() {

var util = this.Schema.util;
var Resource = this.Schema.Resource;
var Record = this.Schema.Record;

/**
 * Collection constructor
 *
 * @param  string url
 * @param  object result
 * @param  Client client
 */
var Collection = this.Schema.Collection = function(url, result, client) {

    this.count = 0;
    this.page = 0;
    this.pages = {};
    this.length = 0;

    if (result && result.$data) {
        this.count = result.$data.count;
        this.page = result.$data.page;
        this.pages = result.$data.pages || {};
        this.length = result.$data.results
            && result.$data.results.length || 0;
    }

    result.$data = result.$data.results;
    result = this.__buildRecords(url, result, client);

    Resource.call(this, url, result, client);

    this.results = [];
    for (var i = 0; i < this.length; i++) {
        this.results[i] = this[i];
    }
};

util.inherits(Collection, Resource);

/**
 * Build collection result data into Record resources
 *
 * @param  string url
 * @param  object result
 * @param  Client client
 * @return array
 */
Collection.prototype.__buildRecords = function(url, result, client) {

    if (!(result.$data instanceof Array)) {
        return null;
    }

    var parentUrl = url;
    var qpos = url.indexOf('?');
    if (qpos !== -1) {
        url = url.substring(0, qpos);
    }

    url = '/' + url.replace(/^\//, '').replace(/\/$/, '');
    for (var i = 0; i < result.$data.length; i++) {
        var record = result.$data[i];
        var recordUrl = url + '/' + record.id;
        result.$data[i] = new Record(
            recordUrl,
            {$data: record, $links: result.$links},
            client,
            this
        );
    }

    return result;
};

/**
 * Iterate over results array style
 *
 * @param  function callback
 */
Collection.prototype.each = function(callback) {
    for (var i = 0; i < this.length; i++) {
        callback.call(this, this[i]);
    }
};

/**
 * Collection as inspected
 *
 * @return object
 */
Collection.prototype.inspect = function() {
    var props = {
        count: this.count,
        results: this.results,
        page: this.page,
        pages: this.pages
    };
    for (var i = 0; i < this.length; i++) {
        if (this.$links) {
            props.$links = this.$links;
        }
    }
    return util.inspect(props);
};

// Exports for Node
if (typeof exports !== 'undefined') {
    exports.Collection = this.Schema.Collection;
}

}).call(this);