(function() {
  var Client, EventEmitter, Linda, LindaBase, LindaClient, LindaSocketIOClient, Parse, Script, SocketIOClient, TupleSpace, async, mm, moment, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require("methodmissing");

  EventEmitter = require("EventEmitter2").EventEmitter2;

  LindaClient = require("../../linda-client/lib/client");

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  moment = require("moment");

  sys = require("sys");

  _ = require("underscore");

  async = require("async");

  Client = require("./client");

  Parse = require("parse").Parse;

  Linda = LindaClient.Linda;

  TupleSpace = LindaClient.TupleSpace;

  LindaBase = null;

  Script = (function(_super) {
    var callbackId;

    __extends(Script, _super);

    Script.prototype.cid = "";

    Script.socket = null;

    Script.linda = null;

    Script.vc = null;

    function Script(id) {
      var socket,
        _this = this;
      this.id = id;
      this.addResult = __bind(this.addResult, this);
      this.connect = __bind(this.connect, this);
      socket = SocketIOClient.connect("http://linda.babascript.org/");
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
      return mm(this, function(key, args) {
        return _this.methodmissing(key, args);
      });
    }

    Script.prototype.connect = function() {
      return this._connect();
    };

    Script.prototype._connect = function() {
      var task, _i, _len, _ref, _results;
      if (this.tasks.length > 0) {
        _ref = this.tasks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          task = _ref[_i];
          _results.push(this.humanExec(task.key, task.args));
        }
        return _results;
      }
    };

    Script.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      if (this.linda.io.socket.connecting != null) {
        return this.humanExec(key, args);
      } else {
        return this.tasks.push({
          key: key,
          args: args
        });
      }
    };

    Script.prototype.humanExec = function(key, args) {
      var callback, cid, h, i, tuple, _i, _ref,
        _this = this;
      if (typeof args[args.length - 1] !== "function") {
        throw new Error("last args should be callback function");
      }
      cid = callbackId();
      tuple = this.createTupleWithOption(key, cid, args[0]);
      callback = args[args.length - 1];
      this.once("" + cid + "_callback", callback);
      this.sts.write(tuple);
      if (tuple.type === "broadcast") {
        h = [];
        for (i = _i = 0, _ref = tuple.count; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          h.push(function(callback) {
            return _this.addResult(cid, callback);
          });
        }
        return async.parallel(h, function(err, results) {
          if (err) {
            throw err;
          }
          _this.cancel(cid);
          return _this.emit("" + cid + "_callback", results);
        });
      } else {
        return this.waitReturn(cid, function(tuple) {
          return _this.emit("" + cid + "_callback", tuple);
        });
      }
    };

    Script.prototype.createTupleWithOption = function(key, cid, option) {
      var k, timeFormat, timeout, tuple, v;
      tuple = {
        baba: "script",
        type: option.type || "eval",
        key: key,
        cid: cid || option.cid,
        format: option.format || "boolean"
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

    Script.prototype.waitReturn = function(cid, callback) {
      var _this = this;
      return this.sts.take({
        baba: "script",
        type: "return",
        cid: cid
      }, function(err, tuple) {
        var result, worker;
        worker = _this.createWorker(tuple.data.worker);
        result = {
          value: tuple.data.value,
          worker: worker
        };
        return callback.call(_this, result);
      });
    };

    Script.prototype.addResult = function(cid, callback) {
      var _this = this;
      return this.waitReturn(cid, function(r) {
        return callback(null, r);
      });
    };

    Script.prototype.createWorker = function(worker) {
      var _this = this;
      return mm(this, function(key, args) {
        if (typeof args[0] === 'function') {
          args[1] = args[0];
          args[0] = {};
        }
        args[0].unicast = worker;
        return _this.methodmissing(key, args);
      });
    };

    callbackId = function() {
      return "" + (moment().unix()) + "_" + (Math.random(1000000));
    };

    return Script;

  })(EventEmitter);

  module.exports = Script;

}).call(this);
