(function() {
  'use strict';
  var BabaScript, NodeBabaScript, mm,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require('methodmissing');

  BabaScript = require('./script');

  module.exports = NodeBabaScript = (function(_super) {
    __extends(NodeBabaScript, _super);

    function NodeBabaScript(id, options) {
      NodeBabaScript.__super__.constructor.call(this, id, options);
      return mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodMissing(key, args);
        };
      })(this));
    }

    return NodeBabaScript;

  })(BabaScript);

}).call(this);
