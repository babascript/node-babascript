'use strict';
var BabaScript, BrowserBabaScript, Reflect, proxyFunc,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Reflect = require('harmony-reflect');

BabaScript = require('./script');

proxyFunc = function(target, callback) {
  return Proxy(target, {
    get: (function(_this) {
      return function(target, name, receiver) {
        var ele;
        ele = target[name];
        if (ele != null) {
          if (Object.prototype.toString.call(ele === '[object Function]')) {
            return function() {
              return ele.apply(null, arguments);
            };
          }
          return ele;
        } else {
          return function() {
            return callback(name, arguments);
          };
        }
      };
    })(this),
    set: function(target, name, val, receive) {
      target[name] = val;
      return target;
    }
  });
};

window.BabaScript = module.exports = BrowserBabaScript = (function(_super) {
  __extends(BrowserBabaScript, _super);

  function BrowserBabaScript(id, option) {
    BrowserBabaScript.__super__.constructor.call(this, id, option);
    return proxyFunc(this, (function(_this) {
      return function(key, args) {
        return _this.methodMissing(key, args);
      };
    })(this));
  }

  return BrowserBabaScript;

})(BabaScript);
