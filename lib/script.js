(function() {
  var Client, EventEmitter, Linda, LindaBase, LindaClient, Members, Parse, Script, TupleSpace, async, crypto, mm, moment, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require("methodmissing");

  EventEmitter = require("events").EventEmitter;

  crypto = require("crypto");

  LindaClient = require("../../linda-client/lib/client");

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

    function Script(id) {
      var _this = this;
      this.id = id;
      this.addResult = __bind(this.addResult, this);
      this.connect = __bind(this.connect, this);
      if (LindaBase == null) {
        LindaBase = new Linda("http://localhost:5000");
      }
      this.vms = [];
      this.isInitialized = false;
      this.ts = new TupleSpace(this.id, LindaBase);
      this.tasks = [];
      this.resultList = {};
      this.count = {};
      console.log(LindaBase.isConnecting());
      if (!LindaBase.io.connecting) {
        LindaBase.io.once("connect", this.connect);
      } else {
        this.connect();
      }
      return mm(this, function(key, args) {
        return _this.methodmissing(key, args);
      });
    }

    Script.prototype.connect = function() {
      var APPID, JSKEY, query,
        _this = this;
      APPID = "pyvshzjKW4PjrGsnyzFigtWk9AQYtSO1FpQ1U2jX";
      JSKEY = "snbc64DVUJOSgQ3hs91hqwAaKgTfBjkSRFg8suOG";
      Parse.initialize(APPID, JSKEY);
      query = new Parse.Query("masuilab");
      return query.find({
        success: _.bind(function(list) {
          var arg, callback, t;
          _this.isInitialized = true;
          arg = {
            channels: ["masuilab"],
            data: {
              action: "org.babascript.android.UPDATE_STATUS",
              msg: "ping"
            }
          };
          callback = {
            success: function() {},
            error: function() {}
          };
          Parse.Push.send(arg, callback);
          _this._connect();
          _this.ts.write({
            baba: "script",
            type: "aliveCheck"
          });
          t = {
            baba: "script",
            type: "alive",
            alive: true
          };
          return _this.ts.watch(t, function(tuple, info) {
            var v;
            v = _.filter(_this.vms, function(vm) {
              return vm.id === tuple.id;
            });
            return v = null;
          });
        }),
        error: function(err) {
          this.isInitialized = true;
          return this._connect();
        }
      });
    };

    Script.prototype._connect = function() {
      var task, _i, _len, _ref, _results;
      _ref = this.tasks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        task = _ref[_i];
        _results.push(this.humanExec(task.key, task.args));
      }
      return _results;
    };

    Script.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      if (LindaBase.isConnecting()) {
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
      this.resultList[cid] = [];
      tuple = this.createTupleWithOption(key, cid, args[0]);
      callback = args[args.length - 1];
      this.once("" + cid + "_callback", callback);
      this.ts.write(tuple);
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
        return this.waitReturn(cid, function(tuple, info) {
          return _this.emit("" + cid + "_callback", tuple, info);
        });
      }
    };

    Script.prototype.createTupleWithOption = function(key, cid, option) {
      var k, timeFormat, timeout, tuple, v;
      tuple = {
        baba: "script",
        type: option.type || "eval",
        key: key,
        cid: option.cid || cid,
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
      return this.ts.write({
        baba: "script",
        type: "cancel",
        cid: cid
      });
    };

    Script.prototype.waitReturn = function(cid, callback) {
      var _this = this;
      return this.ts.take({
        baba: "script",
        type: "return",
        cid: cid
      }, function(tuple, info) {
        var result, worker;
        worker = _this.createWorker(tuple.worker);
        result = {
          value: tuple.value,
          worker: worker
        };
        return callback.call(_this, result, info);
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
      var diff, params;
      diff = moment().diff(LindaBase.time);
      params = "" + diff + (moment().unix()) + "_" + (Math.random(1000000));
      return crypto.createHash("md5").update(params, "utf-8").digest("hex");
    };

    return Script;

  })(EventEmitter);

  Members = (function() {
    function Members() {
      this.members = [];
    }

    Members.prototype.add = function(id) {
      var member;
      member = new Person(id);
      return this.members.push(member);
    };

    Members.prototype.get = function(id) {
      var _this = this;
      return _.find(this.members, function(member) {
        return member.id() === id;
      });
    };

    Members.prototype.getOrAdd = function(id) {
      var member, worker,
        _this = this;
      worker = _.find(this.members, function(member) {
        return member.id() === id;
      });
      if (!worker) {
        member = new Person(id);
        this.members.push(member);
      }
      return this.get(id);
    };

    Members.prototype.getAll = function() {
      return this.members;
    };

    Members.prototype.length = function() {
      return this.members.length;
    };

    return Members;

  })();

  module.exports = Script;

}).call(this);
