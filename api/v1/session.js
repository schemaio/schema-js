var resource = require('./resource');

module.exports = resource.defineMethods('session', {
  get: [
    'get', '/session'
  ],
  update: [
    'put', '/session'
  ]
});
