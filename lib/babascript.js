(function() {
  var EventEmitter, Linda, LindaBase, LindaClient, Person, Persons, TupleSpace, crypto, mm, moment, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require("methodmissing");

  EventEmitter = require("events").EventEmitter;

  crypto = require("crypto");

  LindaClient = require("../../linda-client/lib/client");

  Linda = LindaClient.Linda;

  TupleSpace = LindaClient.TupleSpace;

  moment = require("moment");

  sys = require("sys");

  LindaBase = null;

  _ = require("underscore");

  Person = (function(_super) {
    var callbackId;

    __extends(Person, _super);

    Person.prototype.cid = "";

    function Person(id, base) {
      var _this = this;
      this.id = id;
      this.base = base;
      this.returnTake = __bind(this.returnTake, this);
      this.connect = __bind(this.connect, this);
      if (LindaBase == null) {
        LindaBase = new Linda(this.base || "http://linda.masuilab.org");
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
      var callback, cid, count, k, options, order, timeFormat, tuple, v, worker, _ref,
        _this = this;
      if (typeof args[args.length - 1] !== "function") {
        throw new Error("last args should be callback function");
      }
      cid = callbackId();
      options = {
        "cid": cid
      };
      order = "eval";
      this.resultList[cid] = [];
      count = 0;
      _ref = args[0];
      for (k in _ref) {
        v = _ref[k];
        switch (k) {
          case "broadcast":
            count = v - 1;
            order = "broadcast";
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
            options["format"] = v;
            break;
          case "timeout":
            timeFormat = "YYYY-MM-DD HH:mm:ss";
            options["timeout"] = moment().add("seconds", v).format(timeFormat);
            break;
          default:
            options[k] = v;
        }
      }
      if (options["format"] == null) {
        options["format"] = "boolean";
      }
      callback = args[args.length - 1];
      tuple = [
        "babascript", order, key, options, {
          callback: cid
        }
      ];
      this.ts.write(tuple);
      this.count[cid] = count;
      this.once("" + cid + "_callback", callback);
      this.on("" + cid + "_recall", function() {
        return _this.ts.take(["babascript", "return", cid], _this.returnTake);
      });
      return this.emit("" + cid + "_recall");
    };

    Person.prototype.returnTake = function(tuple, info) {
      var cid, r, result, _i, _len, _ref;
      cid = tuple[2];
      this.resultList[cid].push({
        value: tuple[3],
        worker: this
      });
      if (this.count[cid] > 0) {
        this.count[cid];
        return this.emit("" + cid + "_recall");
      } else {
        this.ts.write(["babascript", "cancel", cid]);
        result = [];
        _ref = this.resultList[cid];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          r = _ref[_i];
          result.push(r);
        }
        if (result.length === 1) {
          result = result[0];
        }
        return this.emit("" + cid + "_callback", result, info);
      }
    };

    callbackId = function() {
      var diff, params;
      diff = moment().diff(LindaBase.time);
      params = "" + diff + (moment().unix()) + "_" + (Math.random(1000000));
      return crypto.createHash("md5").update(params, "utf-8").digest("hex");
    };

    return Person;

  })(EventEmitter);

  Persons = (function(_super) {
    __extends(Persons, _super);

    function Persons(name) {
      var self;
      this.name = name;
      this.returnTake = __bind(this.returnTake, this);
      this.connect = __bind(this.connect, this);
      self = Persons.__super__.constructor.call(this, this.name);
      this.members = [];
      return self;
    }

    Persons.prototype.connect = function() {
      var _this = this;
      Persons.__super__.connect.call(this);
      this.ts.write(["babascript", "alivecheck"]);
      return this.ts.watch(["babascript", "alive"], function(tuple, info) {
        var flag, member, person, _i, _len, _ref;
        flag = false;
        _ref = _this.members;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          member = _ref[_i];
          if (member.id.toString() === tuple[2].toString()) {
            flag = true;
          }
        }
        if (!flag) {
          person = new Person(tuple[2]);
          return _this.members.push(person);
        }
      });
    };

    Persons.prototype.returnTake = function(tuple, info) {
      var cid, r, result, worker, _i, _len, _ref,
        _this = this;
      cid = tuple[2];
      worker = _.find(this.members, function(member) {
        return member.id().toString() === tuple[4].worker.toString();
      });
      this.resultList[cid].push({
        value: tuple[3],
        worker: worker
      });
      if (this.count[cid] > 0) {
        this.count[cid]--;
        return this.emit("" + cid + "_recall");
      } else {
        this.ts.write(["babascript", "cancel", cid]);
        result = [];
        _ref = this.resultList[cid];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          r = _ref[_i];
          result.push(r);
        }
        if (result.length === 1) {
          result = result[0];
        }
        return this.emit("" + cid + "_callback", result, info);
      }
    };

    return Persons;

  })(Person);

  module.exports = {
    BabaScript: Persons,
    Person: Person,
    Persons: Persons
  };

}).call(this);
