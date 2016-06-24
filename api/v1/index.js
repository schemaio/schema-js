var resource = require('./resource');

var v1 = module.exports;

// Special endpoints
v1.session = require('./session');
v1.account = require('./account');
v1.cart = require('./cart');
v1.card = require('./card');

// Public endpoints
v1.blogs = require('./blogs');
v1.categories = require('./categories');
v1.products = require('./products');
v1.pages = require('./pages');

// Standard models
v1.accounts = resource.defineModel('accounts');
v1.carts = resource.defineModel('carts');
v1.contacts = resource.defineModel('contacts');
v1.coupons = resource.defineModel('coupons');
v1.credits = resource.defineModel('credits');
v1.downloads = resource.defineModel('downloads');
v1.invoices = resource.defineModel('invoices');
v1.notifications = resource.defineModel('notifications');
v1.orders = resource.defineModel('orders');
v1.payments = resource.defineModel('payments');
v1.settings = resource.defineModel('settings');
v1.shipments = resource.defineModel('shipments');
v1.subscriptions = resource.defineModel('subscriptions');
