(function() {
  var BabaScript, BabaScriptBase, Client, EventEmitter, LindaSocketIOClient, SocketIOClient, Util, async, http, mm, moment, request, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require('methodmissing');

  http = require('http');

  Util = require('util');

  request = require('superagent');

  EventEmitter = require("events").EventEmitter;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  Client = require("../../node-babascript-client/lib/client");

  moment = require("moment");

  sys = require("sys");

  _ = require("lodash");

  async = require("async");

  BabaScriptBase = (function(_super) {
    __extends(BabaScriptBase, _super);

    BabaScriptBase.prototype.linda = null;

    BabaScriptBase.prototype.isProcessing = false;

    BabaScriptBase.prototype.defaultFormat = 'boolean';

    BabaScriptBase.prototype.id = '';

    BabaScriptBase.create = function(id, options) {
      if (options == null) {
        options = {};
      }
      return new BabaScript(id, options);
    };

    BabaScriptBase.getLinda = function() {
      var api, socket;
      api = 'http://linda.babascript.org';
      socket = SocketIOClient.connect(api, {
        'force new connection': true
      });
      return new LindaSocketIOClient().connect(socket);
    };

    function BabaScriptBase(id, options) {
      var i, socket, _i, _len, _ref;
      this.options = options != null ? options : {};
      this.__set = __bind(this.__set, this);
      this.set = __bind(this.set, this);
      this.removeMember = __bind(this.removeMember, this);
      this.addMember = __bind(this.addMember, this);
      this.addResult = __bind(this.addResult, this);
      this.cancel = __bind(this.cancel, this);
      this.methodmissing = __bind(this.methodmissing, this);
      this.exec = __bind(this.exec, this);
      this.connect = __bind(this.connect, this);
      BabaScriptBase.__super__.constructor.call(this);
      this.api = ((_ref = this.options) != null ? _ref.manager : void 0) || 'http://linda.babascript.org';
      socket = SocketIOClient.connect(this.api);
      if (this.linda == null) {
        this.linda = new LindaSocketIOClient().connect(socket);
      }
      if (_.isArray(id)) {
        this.id = id.join("::");
        this.sts = [];
        for (_i = 0, _len = id.length; _i < _len; _i++) {
          i = id[_i];
          this.sts.push(this.linda.tuplespace(i));
        }
      } else {
        this.id = id;
        this.sts = [this.linda.tuplespace(this.id)];
      }
      this.tasks = [];
      this.f = {};
      this.execTasks = [];
      this.broadcastTasks = {};
      this.loadingModules = [];
      this.loadedModules = {};
      this.setFlag = true;
      this.event = {};
      EventEmitter.call(this.event);
      if (this.linda.io.socket.open === true) {
        this.connect();
      } else {
        this.linda.io.on("connect", (function(_this) {
          return function() {
            return _this.connect();
          };
        })(this));
      }
      return this;
    }

    BabaScriptBase.prototype.connect = function() {
      return this.next();
    };

    BabaScriptBase.prototype.next = function() {
      var task;
      if (this.tasks.length > 0 && this.linda.io.socket.open && this.setFlag) {
        task = this.tasks.shift();
        this.execTasks.push(task);
        return this.humanExec(task.key, task.args);
      }
    };

    BabaScriptBase.prototype.exec = function(key, args, func) {
      args.callback = func;
      return this._do(key, args);
    };

    BabaScriptBase.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect({}, {
          showHidden: true,
          depth: 2
        });
      }
      args.callback = args[args.length - 1];
      return this._do(key, args);
    };

    BabaScriptBase.prototype._do = function(key, args) {
      args.cid = this.callbackId();
      this.tasks.push({
        key: key,
        args: args
      });
      return this.next();
    };

    BabaScriptBase.prototype.humanExec = function(key, args) {
      var callback, cancelid, cid, h, i, ts, tuple, _i, _ref;
      this.isProcessing = true;
      cid = this.callbackId();
      tuple = this.createTupleWithOption(key, cid, args[0]);
      if (typeof args[args.length - 1] === "function") {
        callback = args[args.length - 1];
      } else if (typeof args.callback === "function") {
        callback = args.callback;
      } else {
        callback = function() {};
      }
      this.once("" + cid + "_callback", callback);
      if (tuple.type === "broadcast") {
        h = [];
        this.f[cid] = [];
        this.broadcastTasks[cid] = [];
        for (i = _i = 0, _ref = tuple.count; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          h.push((function(_this) {
            return function(c) {
              return _this.f[cid].push(c);
            };
          })(this));
          this.addResult(cid);
        }
        async.parallel(h, (function(_this) {
          return function(err, results) {
            var ts, _j, _len, _ref1;
            if (err) {
              throw err;
            }
            cid = results[0].task.cid;
            _this.f[cid] = null;
            _ref1 = _this.sts;
            for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
              ts = _ref1[_j];
              ts.take({
                type: 'broadcast',
                cid: cid
              }, function() {
                _this.cancel(cid);
                return _this.broadcastTasks[cid] = null;
              });
            }
            return setImmediate(function() {
              _this.emit("" + cid + "_callback", results);
              _this.next();
              return _this.isProcessing = false;
            });
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var ts, _j, _len, _ref1, _results;
            _ref1 = _this.sts;
            _results = [];
            for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
              ts = _ref1[_j];
              _results.push(ts.write(tuple));
            }
            return _results;
          };
        })(this), 1000);
      } else {
        ts = this.sts.shift();
        ts.write(tuple);
        cancelid = ts.take({
          type: 'cancel',
          cid: cid
        }, (function(_this) {
          return function(err, tuple) {
            if (err) {
              return err;
            }
            _this.emit("" + cid + "_callback", tuple);
            _this.isProcessing = false;
            return _this.next();
          };
        })(this));
        this.waitReturn(ts, cid, (function(_this) {
          return function(tuple) {
            ts.cancel(cancelid);
            _this.emit("" + cid + "_callback", tuple);
            _this.isProcessing = false;
            return _this.next();
          };
        })(this));
        this.sts.push(ts);
      }
      this.next();
      return cid;
    };

    BabaScriptBase.prototype.createTupleWithOption = function(key, cid, option) {
      var k, tuple, v;
      if (option == null) {
        option = {
          type: "eval",
          format: "boolean"
        };
      }
      tuple = {
        baba: "script",
        name: this.id,
        type: option.type || "eval",
        key: key,
        cid: cid || option.cid,
        format: option.format || this.defaultFormat,
        at: Date.now()
      };
      if (typeof option === "function") {
        return tuple;
      }
      for (k in option) {
        v = option[k];
        switch (k) {
          case "broadcast":
            tuple.count = v - 1;
            tuple.type = "broadcast";
            break;
          case "unicast":
            tuple.type = "unicast";
            tuple.unicast = v;
            break;
          case "timeout":
            setTimeout((function(_this) {
              return function() {
                var ts, _i, _len, _ref;
                _this.cancel(cid, _this.broadcastTasks[cid]);
                _ref = _this.sts;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  ts = _ref[_i];
                  ts.cancel(_this.cancelId);
                }
                _this.cancelId = '';
                return _this.emit("" + cid + "_callback", _this.broadcastTasks[cid]);
              };
            })(this), v);
            break;
          default:
            tuple[k] = v;
        }
      }
      return tuple;
    };

    BabaScriptBase.prototype.cancel = function(cid, value) {
      var ts, _i, _len, _ref, _results;
      if (value == null) {
        value = {
          error: 'cancel'
        };
      }
      _ref = this.sts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ts = _ref[_i];
        _results.push(ts.write({
          baba: "script",
          type: "cancel",
          cid: cid,
          value: value
        }));
      }
      return _results;
    };

    BabaScriptBase.prototype.watchCancel = function() {
      var ts, _i, _len, _ref, _results;
      _ref = this.sts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ts = _ref[_i];
        _results.push(ts.watch({
          baba: "script",
          type: "cancel"
        }, (function(_this) {
          return function(err, tuple) {
            var cid, result, value;
            if (err) {
              throw err;
            }
            cid = tuple.data.cid;
            value = tuple.data.value;
            if (value != null) {
              result = value;
            } else {
              result = {
                value: v
              };
            }
            return _this.emit("" + cid + "_callback", result);
          };
        })(this)));
      }
      return _results;
    };

    BabaScriptBase.prototype.waitReturn = function(ts, cid, callback) {
      return ts.take({
        baba: "script",
        type: "return",
        cid: cid
      }, (function(_this) {
        return function(err, tuple) {
          var result, worker;
          if (err === "cancel") {
            return callback.call(_this, {
              value: "cancel"
            });
          }
          worker = tuple.data.worker;
          result = {
            value: tuple.data.value,
            task: tuple.data._task,
            __worker: worker,
            getWorker: function() {
              if (worker === this.id) {
                return this.__self;
              } else {
                return new BabaScript(worker, {});
              }
            }
          };
          return callback.call(_this, result);
        };
      })(this));
    };

    BabaScriptBase.prototype.addResult = function(cid) {
      var ts, _i, _len, _ref, _results;
      _ref = this.sts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ts = _ref[_i];
        _results.push(this.waitReturn(ts, cid, (function(_this) {
          return function(r) {
            var callback;
            _this.broadcastTasks[cid].push(r);
            callback = _this.f[cid].shift();
            return callback(null, r);
          };
        })(this)));
      }
      return _results;
    };

    BabaScriptBase.prototype.callbackId = function() {
      return "" + (moment().unix()) + "_" + (Math.random(1000000));
    };

    BabaScriptBase.prototype.addMember = function(name) {
      return this.sts.push(this.linda.tuplespace(name));
    };

    BabaScriptBase.prototype.removeMember = function(name) {
      var i, ts, _i, _len, _ref, _results;
      _ref = this.sts;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        ts = _ref[i];
        if (ts.name === name) {
          _results.push(this.sts.splice(i, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BabaScriptBase.prototype.set = function(name, mod) {
      this.loadingModules.push({
        name: name,
        body: mod
      });
      return this.__set();
    };

    BabaScriptBase.prototype.__set = function() {
      var mod, name;
      if (this.loadingModules.length === 0) {
        return this.next();
      } else {
        if (this.setFlag) {
          this.setFlag = false;
          mod = this.loadingModules.shift();
          name = mod.name;
          return mod.body.start(this, (function(_this) {
            return function() {
              return setTimeout(function() {
                _this.loadedModules[name] = mod;
                _this.setFlag = true;
                return _this.__set();
              }, 100);
            };
          })(this));
        }
      }
    };

    return BabaScriptBase;

  })(EventEmitter);

  module.exports = BabaScript = (function(_super) {
    __extends(BabaScript, _super);

    function BabaScript(id, options) {
      BabaScript.__super__.constructor.call(this, id, options);
      this.__self = mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodmissing(key, args);
        };
      })(this));
      return this.__self;
    }

    return BabaScript;

  })(BabaScriptBase);

}).call(this);
