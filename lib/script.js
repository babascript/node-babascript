(function() {
  var BabaScript, BabaScriptBase, EventEmitter, LindaAdapter, mm,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require('methodmissing');

  LindaAdapter = require('babascript-linda-adapter');

  EventEmitter = require('events').EventEmitter;

  BabaScript = (function(_super) {
    __extends(BabaScript, _super);

    BabaScript.prototype.defaultFormat = 'boolean';

    function BabaScript(id, options) {
      this.id = id;
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
        this.adapter = new LindaAdapter();
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
      return this.exec(key, args, callback);
    };

    BabaScript.prototype.exec = function(key, args, callback) {
      var cid, task;
      if (typeof callback !== 'function') {
        callback = function() {};
      }
      cid = this.callbackId();
      task = {
        key: key,
        options: args[0],
        callback: callback,
        cid: cid
      };
      this.tasks.push(task);
      this.next();
      return cid;
    };

    BabaScript.prototype.__exec = function(task) {
      var cid, name, plugin, taskid, tuple, _ref, _ref1;
      cid = task.cid;
      tuple = this.createTuple(task);
      this.once("" + cid + "_callback", task.callback);
      taskid = this.adapter.send(tuple);
      _ref = this.plugins;
      for (name in _ref) {
        plugin = _ref[name];
        if ((_ref1 = module.body) != null) {
          _ref1.send(tuple);
        }
      }
      return this.adapter.receive(tuple, (function(_this) {
        return function(err, result) {
          var data, r, _i, _len, _ref2, _ref3;
          if (Array.isArray(result)) {
            data = [];
            cid = result[0].data.cid;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              r = result[_i];
              data.push(r.data);
            }
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
          _this.emit("" + cid + "_callback", data);
          return _this.next();
        };
      })(this));
    };

    BabaScript.prototype.createTuple = function(task) {
      var key, tuple, value, _ref;
      tuple = {
        baba: 'script',
        name: this.id,
        type: 'eval',
        key: task.key,
        cid: task.cid,
        format: task.options.format || this.defaultFormat,
        at: Date.now(),
        options: {}
      };
      if (typeof task.options === 'function') {
        return tuple;
      }
      _ref = task.options;
      for (key in _ref) {
        value = _ref[key];
        if (key === 'broadcast') {
          tuple.type = key;
          tuple.count = value - 1;
        } else if (key === 'timeout') {
          setTimeout((function(_this) {
            return function() {
              var error;
              error = new Error('timeout');
              _this.cancel(task.cid, error);
              return _this.emit("" + task.cid + "_callback", error);
            };
          })(this), value);
        } else {
          tuple.options[key] = value;
        }
      }
      return tuple;
    };

    BabaScript.prototype.cancel = function(cid, error) {
      var reason;
      if (error == null) {
        reason = "cancel error";
      }
      return this.adapter.cancel(cid, reason);
    };

    BabaScript.prototype.callbackId = function() {
      return "" + (new Date() / 1000) + "_" + (Math.random(100000));
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

  module.exports = BabaScriptBase = (function(_super) {
    __extends(BabaScriptBase, _super);

    function BabaScriptBase(id, options) {
      BabaScriptBase.__super__.constructor.call(this, id, options);
      this.__self = mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodMissing(key, args);
        };
      })(this));
      return this.__self;
    }

    return BabaScriptBase;

  })(BabaScript);

}).call(this);
