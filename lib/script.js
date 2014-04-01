(function() {
  var EventEmitter, LindaSocketIOClient, Manager, Script, SocketIOClient, async, mm, moment, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require("methodmissing");

  EventEmitter = require("EventEmitter2").EventEmitter2;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  moment = require("moment");

  sys = require("sys");

  _ = require("underscore");

  async = require("async");

  Manager = require("./manager");

  Script = (function(_super) {
    var callbackId;

    __extends(Script, _super);

    Script.prototype.linda = null;

    Script.prototype.isProcessing = false;

    Script.prototype.defaultFormat = "boolean";

    Script.prototype.api = "http://127.0.0.1:3000";

    function Script(_id) {
      this.addResult = __bind(this.addResult, this);
      this.connect = __bind(this.connect, this);
      var socket,
        _this = this;
      socket = SocketIOClient.connect(this.api);
      if (_id instanceof Manager) {
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
      return mm(this, function(key, args) {
        return _this.methodmissing(key, args);
      });
    }

    Script.prototype.connect = function() {
      return this.next();
    };

    Script.prototype.next = function() {
      var task;
      if (this.tasks.length > 0 && !this.isProcessing) {
        task = this.tasks.shift();
        return this.humanExec(task.key, task.args);
      }
    };

    Script.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      this.tasks.push({
        key: key,
        args: args
      });
      if (!this.isProcessing) {
        return this.next();
      }
    };

    Script.prototype.humanExec = function(key, args) {
      var callback, cid, h, i, r, tuple, _i, _ref,
        _this = this;
      this.isProcessing = true;
      cid = callbackId();
      tuple = this.createTupleWithOption(key, cid, args[0]);
      if (typeof args[args.length - 1] === "function") {
        callback = args[args.length - 1];
      } else {
        callback = function() {};
      }
      this.once("" + cid + "_callback", callback);
      this.sts.write(tuple);
      r = null;
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
          _this.emit("" + cid + "_callback", results);
          _this.isProcessing = false;
          return _this.next();
        });
      } else {
        return this.waitReturn(cid, function(tuple) {
          r = tuple;
          _this.emit("" + cid + "_callback", tuple);
          _this.isProcessing = false;
          return _this.next();
        });
      }
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
          task: tuple.data._task,
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
