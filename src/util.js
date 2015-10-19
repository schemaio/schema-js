/**
 * Utils
 */
(function() {

var Promise = this.Promise;

/**
 * Static utils
 */
var util = this.Schema.util = {};

/**
 * Inheritance helper
 *
 * @param  object baseObj
 * @param  object superObj
 */
util.inherits = function(baseObj, superObj) {
    baseObj._base = superObj;
    var tempObj = function(){};
    tempObj.prototype = superObj.prototype;
    baseObj.prototype = new tempObj();
    baseObj.prototype.constructor = baseObj;
};

/**
 * Inspect a variable and output to console
 */
util.inspect = function(arg, options) {
	if (require !== undefined) {
		// NodeJS
		return require('util').inspect(arg, options);
	} else {
		// Browser
		return console.log(arg);
	}
};

// Exports
if (typeof exports !== 'undefined') {
    exports.util = this.Schema.util;
}

}).call(this);