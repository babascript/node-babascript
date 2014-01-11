(function() {
  var Client, EventEmitter, Linda, LindaClient, TupleSpace,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require("events").EventEmitter;

  LindaClient = require("../../linda-client/lib/client");

  TupleSpace = LindaClient.TupleSpace;

  Linda = LindaClient.Linda;

  Client = (function(_super) {
    __extends(Client, _super);

    function Client(name, callbackFunc, cancelFunc) {
      var _this = this;
      this.linda = new Linda("http://localhost:5000");
      this.tasks = [];
      this.id = this.getId();
      this.linda.io.once("connect", function() {
        _this.group = new TupleSpace(name, _this.linda);
        _this.uni = new TupleSpace(_this.id, _this.linda);
        _this.next();
        _this.broadcast();
        _this.unicast();
        return _this.watchAliveCheck();
      });
      if (typeof callbackFunc === "function") {
        this.on("get_task", callbackFunc);
      }
      if (typeof cancelFunc === "function") {
        this.on("cancel_task", cancelFunc);
      }
      return this;
    }

    Client.prototype.next = function() {
      var format, task,
        _this = this;
      if (this.tasks.length > 0) {
        task = this.tasks[0];
        format = task.format;
        return this.emit("get_task", tuple);
      } else {
        return this.group.take({
          baba: "script",
          type: "eval"
        }, function(tuple, info) {
          _this.tasks.push(tuple);
          if (_this.tasks.length > 0) {
            return _this.emit("get_task", tuple);
          }
        });
      }
    };

    Client.prototype.unicast = function() {
      var t,
        _this = this;
      t = {
        baba: "script",
        type: "unicast",
        unicast: this.id
      };
      return this.group.watch(t, function(tuple, info) {
        _this.tasks.push(tuple);
        if (_this.tasks.length > 0) {
          return _this.emit("get_task", tuple);
        }
      });
    };

    Client.prototype.broadcast = function() {
      var t,
        _this = this;
      t = {
        baba: "script",
        type: "broadcast"
      };
      return this.group.watch(t, function(tuple, info) {
        _this.tasks.push(tuple);
        if (_this.tasks.length > 0) {
          return _this.emit("get_task", tuple);
        }
      });
    };

    Client.prototype.watchCancel = function(callback) {
      return this.group.watch({
        baba: "script",
        type: "cancel"
      }, function(tuple, info) {
        var cancelTasks, task, _i, _len, _results;
        console.log("cancel");
        cancelTasks = _.where(this.tasks, {
          cid: tuple.cid
        });
        if (cancelTasks != null) {
          _results = [];
          for (_i = 0, _len = cancelTasks.length; _i < _len; _i++) {
            task = cancelTasks[_i];
            if (task === this.tasks[0]) {
              this.emit("cancel_task", task);
              this.next();
            }
            _results.push(this.tasks.remove(task));
          }
          return _results;
        }
      });
    };

    Client.prototype.returnValue = function(value, options) {
      var task, ts, tuple;
      if (options == null) {
        options = {};
      }
      task = this.tasks[0];
      ts = this.group;
      tuple = {
        baba: "script",
        type: "return",
        value: value,
        cid: task.cid,
        worker: this.id,
        options: options
      };
      ts.write(tuple);
      this.tasks.shift();
      return this.next();
    };

    Client.prototype.watchAliveCheck = function() {
      var _this = this;
      return this.group.watch({
        baba: "script",
        type: "aliveCheck"
      }, function(tuple, info) {
        return _this.group.write({
          baba: "script",
          alive: true,
          id: _this.id
        });
      });
    };

    Client.prototype.getId = function() {
      return "" + (Math.random() * 10000) + "_" + (Math.random() * 10000);
    };

    return Client;

  })(EventEmitter);

  module.exports = Client;

}).call(this);
