var async = require('async'), path = require('path');

module.exports = function (sails, hook_dirname) {

  if (!sails) {
    console.log('Warning! The Sails app injected into sails-util-mvcsloader seems invalid.');
  }

  hook_dirname = hook_dirname || path.dirname(module.parent.filename);

  var Loader = {

    defaults: {},

    injectPolicies: function (dir) {
      require(__dirname + '/libs/policies')(sails, dir);
    },

    injectConfig: function (dir) {
      require(__dirname + '/libs/config')(sails, dir);
    },

    injectControllers: function (dir, cb) {
      require(__dirname + '/libs/controllers')(sails, dir, cb);
    },

    injectModels: function (dir, cb) {
      require(__dirname + '/libs/models')(sails, dir, cb);
    },

    injectServices: function (dir, cb) {
      require(__dirname + '/libs/services')(sails, dir, cb);
    },

    injectResponses: function (dir, cb) {
      require(__dirname + '/libs/responses')(sails, dir, cb);
    },

    injectHelpers: function (dir, cb) {
      require(__dirname + '/libs/helpers')(sails, dir, cb);
    },

    // Inject config and policies synchronously into the Sails app
    configure: function (dir) {
      if (!dir) {
        dir = {
          config: hook_dirname + '/config',
          policies: hook_dirname + '/policies'
        };
      }
      this.injectAll(dir);
    },

    // Inject models, controllers & services asynchronously into the Sails app
    inject: function (dir, next) {
      // sails.log.info(`[!] Sails User Hook loaded from ${hook_dirname}`);
      // No parameters or only a callback (function) as first parameter
      if ((typeof dir === 'function' || !dir) && !next) {
        var tmp = next;
        next = dir || function () {};
        dir = tmp || {
          models: hook_dirname + '/api/models',
          controllers: hook_dirname + '/api/controllers',
          helpers: hook_dirname + '/api/helpers',
          services: hook_dirname + '/api/services',
          responses: hook_dirname + '/api/responses'
        };
      }

      // Backward compatibility, next and dir inverted
      else if (typeof next === 'object' && typeof dir === 'function') {
        var tmp = next;
        next = dir;
        dir = tmp;
      }

      // Be sure to have a callback
      next = next || function () {};

      this.injectAll(dir, next);
    },

    injectAll: function (dir, cb) {
      cb = cb || function () {};

      var self = this;
  
      var toLoad = [];

      var loadModels = function (next) {
        self.injectModels(dir.models, function (err) {
          if (err) {
            return next(err);
          }
          sails.log.verbose('Micro-app-loader: User hook models loaded from ' + dir.models + '.');
          return next(null);
        });
      };

      var loadControllers = function (next) {
        self.injectControllers(dir.controllers, function (err) {
          if (err) {
            return next(err);
          }
          sails.log.verbose('Micro-app-loader: User hook controllers loaded from ' + dir.controllers + '.');
          return next(null);
        });
      };

      var loadHelpers = function (next) {
        self.injectHelpers(dir.helpers, function (err) {
          if (err) {
            return next(err);
          }
          sails.log.verbose('Micro-app-loader: User hook helpers loaded from ' + dir.helpers + '.');
          return next(null);
        });
      };

      var loadServices = function (next) {
        self.injectServices(dir.services, function (err) {
          if (err) {
            return next(err);
          }
          sails.log.verbose('Micro-app-loader: User hook services loaded from ' + dir.services + '.');
          return next(null);
        });
      };

      var loadResponses = function (next) {
        self.injectResponses(dir.responses, function (err) {
          if (err) {
            return next(err);
          }
          return next(null);
        });
      };

      var sailsRoot = process.env.PWD;
      var appRelativePath = hook_dirname.replace(sailsRoot, '');
      var hookName = appRelativePath
        .replace('/index.js', '')
        .replace('/api/hooks/', '')
        .replace('/node_modules/', '');
      
      var isEnable = true;

      if (sails.hooks[hookName] && sails.hooks[hookName].configKey) {
        var configKey = sails.hooks[hookName].configKey;
        var config = sails.config[configKey];
        isEnable = (config && config.enable !== undefined)
          ? config.enable
          : true;
      }
      
      sails.log.info(`Micro-app-loader: ${isEnable ? 'Load' : 'Skip'} "${hookName}" with [${Object.keys(dir).map(e => e.toString())}] from "${appRelativePath}".`);

      if (isEnable) {

        if (dir.policies) {
          self.injectPolicies(dir.policies);
          // sails.log.verbose('Micro-app-loader: User hook policies loaded from ' + dir.policies + '.');
        }
  
        if (dir.config) {
          self.injectConfig(dir.config);
          // sails.log.verbose('Micro-app-loader: User hook config loaded from ' + dir.config + '.');
        }
  
        if (dir.models) {
          toLoad.push(loadModels);
        }
  
        if (dir.controllers) {
          toLoad.push(loadControllers);
        }
  
        if (dir.helpers) {
          toLoad.push(loadHelpers);
        }
  
        if (dir.services) {
          toLoad.push(loadServices);
        }
  
        if (dir.responses) {
          toLoad.push(loadResponses);
        }
  
      }

      async.parallel(toLoad, function (err) {
        if (err) {
          sails.log.error(err);
        }
        if (cb) {
          cb(err);
        }
      });
    }
  };

  // Backward compatibility
  Loader.adapt = Loader.inject;

  return Loader;
};