var Schema = module.exports;

// Globals
global.Promise = require('bluebird');

// Core modules
Schema.Collection = require('./lib/collection');
Schema.Record = require('./lib/record');
Schema.Resource = require('./lib/resource');
Schema.util = require('./lib/util');
Schema.api = require('./api');

// Browser specific
if (process.browser) {
  Schema.Client = require('./browser/client');
  Schema.form = require('./browser/form');
}

/**
 * Set public key and reset public clients
 *
 * @param  string key
 */
Schema.setPublicKey = function(publicKey) {
  Schema.publicKey = publicKey;

  // Auto init public client instance
  if (!Schema.Client) {
    throw new Error('Schema `Client` is undefined');
  }

  Schema.client = new Schema.Client(publicKey);
  Schema.api.apply(Schema, Schema.client, Schema.client.params.versionPath);
};

/**
 * Set private key and reset client
 *
 * @param  string clientId
 * @param  string clientKey
 */
Schema.setClientKey = function(clientId, secretKey) {
  Schema.clientId = clientId;
  Schema.clientKey = secretKey;

  // Auto init private client instance
  if (!Schema.Client) {
    throw new Error('Schema `Client` is undefined');
  }

  Schema.client = new Schema.Client(clientId, secretKey);
  Schema.api.apply(Schema, Schema.client, 'v' + Schema.client.params.versionPath);
};
