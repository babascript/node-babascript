(function() {
  var Baba, Human, Linda, LindaClient, People, TupleSpace, crypto, mm, moment, sys,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  mm = require("methodmissing");

  crypto = require("crypto");

  LindaClient = require("node-linda-client");

  Linda = LindaClient.Linda;

  TupleSpace = LindaClient.TupleSpace;

  moment = require("moment");

  sys = require("sys");

  Human = (function() {
    function Human() {}

    return Human;

  })();

  People = (function() {
    function People() {}

    return People;

  })();

  Baba = (function() {
    Baba.prototype.resultList = {};

    Baba.prototype.connecting = false;

    Baba.prototype.base = "";

    Baba.prototype.space = "";

    Baba.linda = null;

    Baba.prototype.ts = null;

    function Baba(space) {
      this.workDone = __bind(this.workDone, this);
      this.humanExec = __bind(this.humanExec, this);
      this.__noSuchMethod = __bind(this.__noSuchMethod, this);
      var baba,
        _this = this;
      this.base = "http://linda.masuilab.org";
      this.space = space || "baba";
      this.tasks = [];
      this.ids = [];
      if (Baba.linda == null) {
        Baba.linda = new Linda(this.base);
      }
      this.ts = new TupleSpace(this.space, Baba.linda);
      Baba.linda.io.once("connect", function() {
        var task, _i, _len, _ref;
        console.log("connect");
        _this.connecting = true;
        _ref = _this.tasks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          task = _ref[_i];
          _this.humanExec(task.key, task.args);
        }
        return _this.ts.watch(["babascript", "alive"], function(tuple, info) {
          return _this.aliveCheck(tuple[2]);
        });
      });
      Baba.linda.io.once("disconnect", function() {
        return _this.connecting = false;
      });
      baba = mm(this, function(key, args) {
        return _this.__noSuchMethod(key, args);
      });
      return baba;
    }

    Baba.prototype.__noSuchMethod = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      if (this.connecting) {
        return this.humanExec(key, args);
      } else {
        return this.tasks.push({
          key: key,
          args: args
        });
      }
    };

    Baba.prototype.humanExec = function(key, args) {
      var arg, callback, cid, count, hash, k, options, order, seconds, t, timeFormat, timeoutFlag, tuple, value, _i, _len,
        _this = this;
      if (typeof args[args.length - 1] !== 'function') {
        throw Error("last args should be callback function");
      }
      cid = this.callbackId();
      options = {};
      order = "eval";
      this.resultList[cid] = [];
      count = 0;
      hash = {
        type: "babascript",
        order: order,
        key: key,
        options: options,
        callback: cid
      };
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        if (arg["timeout"]) {
          seconds = arg["timeout"];
          timeFormat = "YYYY-MM-DD HH:mm:ss";
          arg["timeout"] = moment().add("seconds", seconds).format(timeFormat);
        }
        if (arg["count"]) {
          count = arg["count"] - 1;
        }
        if (arg["broadcast"]) {
          order = "broadcast";
          count = arg["broadcast"] - 1;
        }
        if (arg["unicast"]) {
          order = arg["unicast"];
        }
        if (typeof arg === 'function') {
          callback = arg;
        } else {
          for (k in arg) {
            value = arg[k];
            options[k] = value;
          }
        }
      }
      options["cid"] = cid;
      tuple = [
        "babascript", order, key, options, {
          "callback": cid
        }
      ];
      this.ts.write(tuple);
      timeoutFlag = false;
      if (tuple[3].timeout != null) {
        timeoutFlag = true;
        t = Math.ceil(-(moment().diff(tuple[3].timeout)) / 1000);
        setTimeout(function() {
          if (timeoutFlag) {
            _this.ts.write(["babascript", "cancel", cid]);
            return _this.ts.take(tuple, function() {
              return callback({
                error: "timeout"
              });
            });
          }
        }, t * 1000);
      }
      return this.ts.take(["babascript", "return", cid], function(_tuple, info, list) {
        var r, result, temp, _j, _len1, _ref;
        timeoutFlag = false;
        if (count > 0) {
          count--;
          _this.resultList[cid].push(_tuple);
          return _this.ts.take(["babascript", "return", cid], arguments.callee);
        } else {
          _this.resultList[cid].push(_tuple);
          _this.ts.write(["babascript", "cancel", cid]);
          result = [];
          _ref = _this.resultList[cid];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            r = _ref[_j];
            result.push(r[3]);
          }
          if (result.length === 1) {
            temp = result[0];
            result = temp;
          }
          return callback(result, info);
        }
      });
    };

    Baba.prototype.callbackId = function() {
      var diff, params;
      diff = moment().diff(Baba.linda.time);
      params = "" + diff + (moment().unix()) + "_" + (Math.random(1000000));
      return crypto.createHash("md5").update(params, "utf-8").digest("hex");
    };

    Baba.prototype.workDone = function() {
      return process.exit();
    };

    Baba.prototype.aliveCheck = function(userid) {
      var flag, id, _i, _len, _ref;
      flag = false;
      _ref = this.ids;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        if (id === userid) {
          flag = true;
        }
      }
      if (!flag) {
        return this.ids.push(userid);
      }
    };

    return Baba;

  })();

  module.exports = Baba;

}).call(this);
