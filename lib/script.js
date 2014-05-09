(function() {
  var EventEmitter, LindaSocketIOClient, ManagerClient, Script, SocketIOClient, async, http, mm, moment, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require("methodmissing");

  http = require('http');

  EventEmitter = require("EventEmitter2").EventEmitter2;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  moment = require("moment");

  sys = require("sys");

  _ = require("underscore");

  async = require("async");

  ManagerClient = require("../lib/managerclient");

  Script = (function(_super) {
    __extends(Script, _super);

    Script.prototype.linda = null;

    Script.prototype.isProcessing = false;

    Script.prototype.defaultFormat = "boolean";

    Script.prototype.api = "http://linda.babascript.org";

    function Script(_id) {
      this.addResult = __bind(this.addResult, this);
      this.cancel = __bind(this.cancel, this);
      this.connect = __bind(this.connect, this);
      var socket;
      socket = SocketIOClient.connect(this.api);
      if (_id instanceof ManagerClient) {
        this.id = _id.groupName;
      } else {
        this.id = _id;
      }
      if (this.linda == null) {
        this.linda = new LindaSocketIOClient().connect(socket);
      }
      this.sts = this.linda.tuplespace(this.id);
      this.tasks = [];
      if (this.linda.io.socket.connecting != null) {
        this.linda.io.once("connect", this.connect);
      } else {
        this.connect();
      }
      return mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodmissing(key, args);
        };
      })(this));
    }

    Script.prototype.connect = function() {
      this.next();
      return this.watchCancel();
    };

    Script.prototype.next = function() {
      if (this.tasks.length > 0 && !this.isProcessing) {
        this.task = this.tasks.shift();
        return this.humanExec(this.task.key, this.task.args);
      }
    };

    Script.prototype.exec = function(key, arg, func) {
      var args;
      args = [arg, func];
      return this._do(key, args);
    };

    Script.prototype._do = function(key, args) {
      args.cid = this.callbackId();
      this.tasks.push({
        key: key,
        args: args
      });
      if (!this.isProcessing) {
        this.next();
      }
      return args.cid;
    };

    Script.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      args.callback = args[args.length - 1];
      return this._do(key, args);
    };

    Script.prototype.humanExec = function(key, args) {
      var callback, cid, h, i, id, r, tuple, _i, _ref;
      this.isProcessing = true;
      cid = args.cid;
      tuple = this.createTupleWithOption(key, cid, args[0]);
      if (typeof args[args.length - 1] === "function") {
        callback = args[args.length - 1];
      } else {
        callback = function() {};
      }
      this.once("" + cid + "_callback", callback);
      id = this.sts.write(tuple);
      r = null;
      if (tuple.type === "broadcast") {
        h = [];
        for (i = _i = 0, _ref = tuple.count; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          h.push((function(_this) {
            return function(callback) {
              return _this.addResult(cid, callback);
            };
          })(this));
        }
        async.parallel(h, (function(_this) {
          return function(err, results) {
            if (err) {
              throw err;
            }
            _this.emit("" + cid + "_callback", results);
            _this.isProcessing = false;
            return _this.next();
          };
        })(this));
      } else {
        this.waitReturn(cid, (function(_this) {
          return function(tuple) {
            r = tuple;
            _this.emit("" + cid + "_callback", tuple);
            _this.isProcessing = false;
            return _this.next();
          };
        })(this));
      }
      return cid;
    };

    Script.prototype.createTupleWithOption = function(key, cid, option) {
      var k, timeFormat, timeout, tuple, v;
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
        format: option.format || this.defaultFormat
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
            timeFormat = "YYYY-MM-DD HH:mm:ss";
            timeout = moment().add("seconds", v).format(timeFormat);
            tuple.timeout = timeout;
            setTimeout((function(_this) {
              return function() {
                return _this.cancel(cid);
              };
            })(this), v);
            break;
          default:
            tuple[k] = v;
        }
      }
      return tuple;
    };

    Script.prototype.cancel = function(cid) {
      return this.sts.write({
        baba: "script",
        type: "cancel",
        cid: cid
      });
    };

    Script.prototype.watchCancel = function() {
      return this.sts.watch({
        baba: "script",
        type: "cancel"
      }, (function(_this) {
        return function(err, tuple) {
          var cid, i, _i, _ref, _results;
          if (err) {
            throw err;
          }
          cid = tuple.data.cid;
          if (_this.task.args.cid === cid) {
            _this.task.args.callback({
              value: "cancel"
            });
            _this.task = null;
            _this.isProcessing = false;
            _this.next();
            return;
          }
          if (_this.tasks.length === 0) {
            return;
          }
          _results = [];
          for (i = _i = 0, _ref = _this.tasks.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            if (_this.tasks[i].args.cid === cid) {
              _this.tasks[i].args.callback({
                value: "cancel"
              });
              _results.push(_this.tasks.splice(i, 1));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    };

    Script.prototype.waitReturn = function(cid, callback) {
      return this.sts.take({
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
          worker = _this.createWorker(tuple.data.worker);
          result = {
            value: tuple.data.value,
            task: tuple.data._task,
            worker: worker
          };
          return callback.call(_this, result);
        };
      })(this));
    };

    Script.prototype.addResult = function(cid, callback) {
      return this.waitReturn(cid, (function(_this) {
        return function(r) {
          return callback(null, r);
        };
      })(this));
    };

    Script.prototype.createWorker = function(worker) {
      return new Script(worker);
    };

    Script.prototype.callbackId = function() {
      return "" + (moment().unix()) + "_" + (Math.random(1000000));
    };

    return Script;

  })(EventEmitter);

  module.exports = Script;

}).call(this);
