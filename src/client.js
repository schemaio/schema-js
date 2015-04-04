/**
 * Schema API Client for JS
 */
(function() {

// Not relevant for Node
if (exports) {
    return;
}

var util = this.Schema.util;

/**
 * @param  string clientId
 * @param  string publicKey
 * @param  object options
 */
var Client = this.Schema.Client = function(clientId, publicKey, options) {

    if (typeof publicKey === 'object') {
        options = publicKey;
        publicKey = clientId;
    } else if (typeof clientId === 'object') {
        options = clientId;
        clientId = undefined;
    }
    this.options = {
        clientId: clientId || options.clientId,
        publicKey: publicKey || options.publicKey || this.Schema.publicKey,
        apiUrl: options.apiUrl || 'https://api.schema.io',
        vaultUrl: options.vaultUrl || 'https://vault.schema.io',
        verifyCert: options.verifyCert || true,
        version: options.version || 1
    };
};

}).call(this);

