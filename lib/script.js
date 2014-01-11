(function() {
  var EventEmitter, Linda, LindaBase, LindaClient, Members, Person, Persons, TupleSpace, async, crypto, mm, moment, sys, _,
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

  Linda = LindaClient.Linda;

  TupleSpace = LindaClient.TupleSpace;

  LindaBase = null;

  Person = (function(_super) {
    var callbackId;

    __extends(Person, _super);

    Person.prototype.cid = "";

    function Person(id) {
      var _this = this;
      this.id = id;
      this.addResult = __bind(this.addResult, this);
      this.connect = __bind(this.connect, this);
      if (LindaBase == null) {
        LindaBase = new Linda("http://linda.masuilab.org");
      }
      this.ts = new TupleSpace(this.id, LindaBase);
      this.tasks = [];
      this.resultList = {};
      this.count = {};
      if (!LindaBase.io.connecting) {
        LindaBase.io.once("connect", this.connect);
      }
      return mm(this, function(key, args) {
        return _this.methodmissing(key, args);
      });
    }

    Person.prototype.connect = function() {
      var task, _i, _len, _ref, _results;
      _ref = this.tasks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        task = _ref[_i];
        _results.push(this.humanExec(task.key, task.args));
      }
      return _results;
    };

    Person.prototype.methodmissing = function(key, args) {
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

    Person.prototype.humanExec = function(key, args) {
      var callback, cid, count, h, i, k, timeFormat, timeout, tuple, v, worker, _i, _ref,
        _this = this;
      if (typeof args[args.length - 1] !== "function") {
        throw new Error("last args should be callback function");
      }
      cid = callbackId();
      this.resultList[cid] = [];
      count = 0;
      tuple = {
        baba: "script",
        type: "eval",
        key: key,
        cid: cid,
        format: "boolean"
      };
      _ref = args[0];
      for (k in _ref) {
        v = _ref[k];
        switch (k) {
          case "broadcast":
            count = v - 1;
            tuple.type = "broadcast";
            break;
          case "unicast":
            if (this.members != null) {
              worker = _.find(this.members, function(m) {
                return m.id().toString() === v;
              });
              if (worker != null) {
                worker.humanExec(key, args);
                return;
              }
            }
            break;
          case "format":
            tuple.format = v;
            break;
          case "timeout":
            timeFormat = "YYYY-MM-DD HH:mm:ss";
            timeout = moment().add("seconds", v).format(timeFormat);
            format.timeout = timeout;
            break;
          default:
            tuple[k] = v;
        }
      }
      callback = args[args.length - 1];
      this.once("" + cid + "_callback", callback);
      this.ts.write(tuple);
      if (tuple.type === "broadcast") {
        h = [];
        for (i = _i = 0; 0 <= count ? _i <= count : _i >= count; i = 0 <= count ? ++_i : --_i) {
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

    Person.prototype.cancel = function(cid) {
      return this.ts.write({
        baba: "script",
        type: "cancel",
        cid: cid
      });
    };

    Person.prototype.waitReturn = function(cid, callback) {
      var _this = this;
      return this.ts.take({
        baba: "script",
        type: "return",
        cid: cid
      }, function(tuple, info) {
        var result, worker;
        if (!_this.members) {
          result = {
            value: tuple.value,
            worker: tuple.worker
          };
        } else {
          worker = _this.members.getOrAdd(tuple.worker);
          result = {
            value: tuple.value,
            worker: worker
          };
        }
        return callback.call(_this, result, info);
      });
    };

    Person.prototype.addResult = function(cid, callback) {
      var _this = this;
      return this.waitReturn(cid, function(r) {
        var worker;
        worker = _this.members.getOrAdd(r.worker.id());
        return callback(null, {
          value: r.value,
          worker: worker
        });
      });
    };

    callbackId = function() {
      var diff, params;
      diff = moment().diff(LindaBase.time);
      params = "" + diff + (moment().unix()) + "_" + (Math.random(1000000));
      return crypto.createHash("md5").update(params, "utf-8").digest("hex");
    };

    return Person;

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

  Persons = (function(_super) {
    __extends(Persons, _super);

    function Persons(name) {
      var self;
      this.name = name;
      this.connect = __bind(this.connect, this);
      self = Persons.__super__.constructor.call(this, this.name);
      this.members = new Members();
      return self;
    }

    Persons.prototype.connect = function() {
      var t,
        _this = this;
      Persons.__super__.connect.call(this);
      this.ts.write({
        baba: "script",
        type: "aliveCheck"
      });
      t = {
        baba: "script",
        alive: true
      };
      return this.ts.watch(t, function(tuple, info) {
        var flag, member, _i, _len, _ref;
        flag = false;
        _ref = _this.members.getAll;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          member = _ref[_i];
          if (member.id().toString() === tuple.id.toString()) {
            flag = true;
          }
        }
        if (!flag) {
          return _this.members.add(tuple.id);
        }
      });
    };

    return Persons;

  })(Person);

  module.exports = {
    Persons: Persons,
    Person: Person,
    Members: Members
  };

}).call(this);
