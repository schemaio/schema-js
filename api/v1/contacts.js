var resource = require('./resource');

module.exports = resource.defineModel('contacts', {
  subscribe: [
    'post', '/contacts/subscribe', [ 'email', 'email_optin_lists' ]
  ],
  unsubscribe: [
    'post', '/contacts/unsubscribe', [ 'email', 'email_optin_lists' ]
  ]
});
