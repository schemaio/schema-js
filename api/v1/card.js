var schema = require('../index');
var stripe = require('./stripe');
var resource = require('./resource');

var card = module.exports;

// Create a card token
card.createToken = function createToken(data, callback) {
  var error = card.validate(data);
  if (error) {
    return cardError(error, callback);
  }

  normalizeCard(data);

  return vault(this.client).post('/tokens', data);
};

// Validate card details
card.validate = function(data) {
  var error;
  var param;

  if (!card.validateCardNumber(data.number)) {
    error = 'Card number appears to be invalid';
    param = 'number';
  }
  if (data.exp) {
    var exp = card.cardExpiry(data.exp);
    data.exp_month = exp.month;
    data.exp_year = exp.year;
  }
  if (!card.validateExpiry(card.exp_month, card.exp_year)) {
    error = 'Card expiry appears to be invalid';
    param = 'exp_month';
  }
  if (!card.validateCVC(card.cvc)) {
    error = 'Card CVC code appears to be invalid';
    param = 'exp_cvc';
  }

  if (error) {
    return { message: error, param: param };
  }
};

// Validate card number
card.validateCardNumber = function() {
  return stripe.card.validateCardNumber.apply(stripe, arguments);
};

// Validate card expiry
card.validateExpiry = function() {
  return stripe.card.validateExpiry.apply(stripe, arguments);
};

// Validate card CVC code
card.validateCVC = function() {
  return stripe.card.validateCVC.apply(stripe, arguments);
};

// Parse card expiry from a string value
card.cardExpiry = function(value) {
  if (value && value.month && value.year) {
    return value;
  }

  var parts = new String(value).split(/[\s\/\-]+/, 2);
  var month = parts[0];
  var year = parts[1];

  // Convert 2 digit year
  if (year && year.length === 2 && /^\d+$/.test(year)) {
    var prefix = (new Date).getFullYear().toString().substring(0, 2);
    year = prefix + year;
  }

  return {
    month: ~~month,
    year: ~~year
  };
};

// Determine card type
card.cardType = function() {
  return stripe.card.cardType.apply(stripe, arguments);
};

// Make card data normal
function normalizeCard(data) {
  if (!data.billing) {
    data.billing = {};
  }
  // Stripe param compatibility
  if (data.address_line1) {
    data.billing.address1 = data.address_line1;
    delete data.address_line1;
  }
  if (data.address_line2) {
    data.billing.address2 = data.address_line2;
    delete data.address_line2;
  }
  if (data.address_city) {
    data.billing.city = data.address_city;
    delete data.address_city;
  }
  if (data.address_state) {
    data.billing.state = data.address_state;
    delete data.address_state;
  }
  if (data.address_zip) {
    data.billing.zip = data.address_zip;
    delete data.address_zip;
  }
  if (data.address_country) {
    data.billing.country = data.address_country;
    delete data.address_country;
  }
}

// Handle error response
function cardError(error, callback) {
  if (callback) {
    setTimeout(function() {
      callback(402, {error: error});
    }, 1);
  }
  return Promise.reject(error);
}

// Get a vault client instance
function vault(client) {
  if (client.__vaultClient) {
    return client.__vaultClient;
  }
  return client.__vaultClient = new schema.Client(client.params.publicKey, {
    host: schema.Client.defaults.vault
  });
};
