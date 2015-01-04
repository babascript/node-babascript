'use strict';
var BabaScript, EventEmitter, LindaAdapter, Promise, Task,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LindaAdapter = require('babascript-linda-adapter');

EventEmitter = require('events').EventEmitter;

Promise = require('es6-promise').Promise;

Task = require('./task');

module.exports = BabaScript = (function(_super) {
  __extends(BabaScript, _super);

  BabaScript.address = 'http://babascript-linda.herokuapp.com';

  function BabaScript(id, options) {
    this.id = id != null ? id : 'noname';
    this.options = options != null ? options : {};
    this.__set = __bind(this.__set, this);
    this.set = __bind(this.set, this);
    this.cancel = __bind(this.cancel, this);
    this.__exec = __bind(this.__exec, this);
    this.exec = __bind(this.exec, this);
    this.methodMissing = __bind(this.methodMissing, this);
    if (this.options.adapter != null) {
      this.adapter = this.options.adapter;
    } else {
      this.adapter = new LindaAdapter(this.address, {
        port: 80
      });
    }
    this.adapter.attach(this);
    this.tasks = [];
    this.loadingPlugins = [];
    this.plugins = {};
    this.data = {};
    this.on("connect", this.connect);
  }

  BabaScript.prototype.connect = function() {
    var name, plugin, _ref, _ref1;
    _ref = this.plugins;
    for (name in _ref) {
      plugin = _ref[name];
      if ((_ref1 = plugin.body) != null) {
        _ref1.connect();
      }
    }
    return this.next();
  };

  BabaScript.prototype.next = function() {
    var task;
    if (this.tasks.length > 0) {
      task = this.tasks.shift();
      return this.__exec(task);
    }
  };

  BabaScript.prototype.methodMissing = function(key, args) {
    var callback;
    if (key === 'inspect') {
      return require('sys').inspect({}, {
        showHidden: true,
        depth: 2
      });
    }
    callback = args[args.length - 1];
    return this.exec(key, args[0], callback);
  };

  BabaScript.prototype.exec = function(key, args, callback) {
    var cid, p, task;
    task = new Task(this.id, key, args);
    cid = task.get('cid');
    this.tasks.push(task);
    this.next();
    if (typeof callback !== 'function') {
      p = new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.once("" + cid + "_callback", function(err, data) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve(data);
            }
          });
        };
      })(this));
      p.cid = cid;
      return p;
    } else {
      this.once("" + cid + "_callback", callback);
      return cid;
    }
  };

  BabaScript.prototype.__exec = function(task) {
    var name, plugin, tuple, _ref, _ref1;
    tuple = task.toTuple();
    if (tuple.timeout != null) {
      setTimeout((function(_this) {
        return function() {
          return _this.cancel(tuple.cid, 'timeout');
        };
      })(this), tuple.timeout);
    }
    _ref = this.plugins;
    for (name in _ref) {
      plugin = _ref[name];
      if ((_ref1 = module.body) != null) {
        _ref1.send(tuple);
      }
    }
    this.adapter.receive(tuple, (function(_this) {
      return function(err, result) {
        var cid, data, r, _i, _len, _ref2, _ref3;
        if (Array.isArray(result)) {
          data = [];
          cid = result[0].data.cid;
          for (_i = 0, _len = result.length; _i < _len; _i++) {
            r = result[_i];
            data.push(r.data);
          }
        } else if (result.data.reason != null) {
          err = new Error(result.data.reason);
          cid = result.data.cid;
          data = null;
        } else {
          cid = result.data.cid;
          data = result.data;
        }
        _ref2 = _this.plugins;
        for (name in _ref2) {
          plugin = _ref2[name];
          if ((_ref3 = module.body) != null) {
            _ref3.receive(data);
          }
        }
        _this.emit("" + cid + "_callback", err, data);
        return _this.next();
      };
    })(this));
    return this.adapter.send(tuple);
  };

  BabaScript.prototype.cancel = function(cid, error) {
    var reason;
    reason = error == null ? "cancel" : error;
    this.adapter.cancel(cid, reason);
    return this.emit("" + cid + "_callback", new Error(reason, null));
  };

  BabaScript.prototype.set = function(name, plugin) {
    this.loadingPlugins.push({
      name: name,
      body: plugin
    });
    return this.__set();
  };

  BabaScript.prototype.__set = function() {
    var name, plugin;
    if (this.loadingPlugins.length === 0) {
      return this.next();
    }
    plugin = this.loadingPlugins.shift();
    name = plugin.name;
    return plugin.body.load(this, (function(_this) {
      return function() {
        _this.plugins[name] = plugin;
        return _this.__set();
      };
    })(this));
  };

  return BabaScript;

})(EventEmitter);
