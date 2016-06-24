var util = require('../lib/util');

// Global `helpers`
global.helpers = module.exports;

// Global `assert`
global.assert = require('chai').assert;

// Global sinon
global.sinon = require('sinon');

// Global `dump`
helpers.dump = global.dump = function() {
  return console.log.apply(this, arguments);
};

// Require modules from base path
helpers.requireBase = function(path) {
  return require('../' + path)
};

// Load and clone fixture data
helpers.getFixture = function(name) {
  return JSON.parse(JSON.stringify(require('./fixtures/' + name)));
};

// API helpers
helpers.api = {
  base: '',
  stubs: {},

  context: {
    client: {
      get: function(){},
      put: function(){},
      post: function(){},
      delete: function(){}
    }
  },

  init: function(version) {
    helpers.api.base = '/' + version;

    var stubs = helpers.api.stubs;
    var context = helpers.api.context;

    beforeEach(function() {
      stubs.get = sinon.stub(context.client, 'get');
      stubs.put = sinon.stub(context.client, 'put');
      stubs.post = sinon.stub(context.client, 'post');
      stubs.delete = sinon.stub(context.client, 'delete');
    });

    afterEach(function() {
      helpers.api.reset();
    });
  },

  reset: function() {
    var keys = Object.keys(helpers.api.stubs);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      helpers.api.stubs[key].restore();
    }
  },

  describeModel: function(model, object, methods, options) {
    var url = '/' + model;
    modelMethods = {
      list: [
        'get', url
      ],
      get: [
        'get', url + '/{id}', [ 'id' ]
      ],
      create: [
        'post', url
      ],
      post: [
        'post', url
      ],
      update: [
        'put', url + '/{id}', ['id']
      ],
      put: [
        'put', url + '/{id}', ['id']
      ],
      delete: [
        'delete', url + '/{id}', ['id']
      ]
    };
    if (methods) {
      Object.keys(methods).map(function(key) {
        modelMethods[key] = methods[key];
      });
    }
    return helpers.api.describeMethods(url, object, modelMethods, options);
  },

  describeMethods: function(url, object, methods, options) {
    var stubs = helpers.api.stubs;

    dump('describeMethods', url, object, methods, options)

    if (methods instanceof Array) {
      // TODO: deprecate array format
      // {name, method, url, args}
    } else if (methods && typeof methods === 'object') {
      var methodsArray = [];
      Object.keys(methods).map(function(key) {
        methodsArray.push({
          name: key,
          method: methods[key][0],
          url: helpers.api.base + methods[key][1],
          args: methods[key][2]
        })
      });
      methods = methodsArray;
    }

    methods.map(function(test) {
      var testName = url
        .replace(/^\//, '')
        .replace('/{id}', '')
        .replace('/', '.')
        + '.' + test.name;
      describe('#' + testName, function() {
        it('calls ' + test.method.toUpperCase() + ' ' + test.url, function() {
          var args = test.args || [];
          var data = { data: true };
          var outputData = { data: true };
          for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (typeof arg === 'string') {
              outputData[arg] = arg;
            }
          }
          args.push(data);
          if (typeof object[test.name] !== 'function') {
            throw new Error('Method `' + testName + '` is not defined');
          }
          object[test.name].apply(helpers.api.context, args);
          assert.strictEqual(stubs[test.method].args[0][0], test.url);
          assert.deepEqual(stubs[test.method].args[0][1], outputData);
          assert.isTrue(stubs[test.method].called);
        });
      });
    });

    if (options) {
      var relations = options.relations;
      if (relations) {
        dump('OK', url, object, relations)
        helpers.api.describeMethodRelations(url, object, relations);
      }
    }
  },

  describeMethodRelations: function(url, object, relations) {
    var relationMethods = {};
    Object.keys(relations).map(function(relName) {
      var rel = relations[relName];
      var relUrl = (url + '/{id}/' + relName).replace(/^\//, '');
      var relObject = object[relName] = object[relName] || {};
      // All methods
      if (rel === true) {
        helpers.api.describeModel(relUrl, relObject);
      } else if (rel && typeof rel === 'object') {
        helpers.api.describeMethods(relUrl, relObject, rel);
      }
    });
  }
};
