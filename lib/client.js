(function() {
  var Client, Linda, LindaClient, TupleSpace;

  LindaClient = require("../../linda-client/lib/client");

  TupleSpace = LindaClient.TupleSpace;

  Linda = LindaClient.Linda;

  Client = (function() {
    function Client(name, callback) {
      var _this = this;
      this.callback = callback;
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
    }

    Client.prototype.next = function() {
      var format, task,
        _this = this;
      if (this.tasks.length > 0) {
        task = this.tasks[0];
        format = task.format;
        return this.callback.call(this, task);
      } else {
        return this.group.take({
          baba: "script",
          type: "eval"
        }, function(tuple, info) {
          _this.tasks.push(tuple);
          if (_this.tasks.length > 0) {
            return _this.callback.call(_this, tuple);
          }
        });
      }
    };

    Client.prototype.unicast = function() {
      var _this = this;
      return this.uni.watch({
        baba: "script",
        type: "eval"
      }, function(tuple, info) {
        tuple.unicast = true;
        _this.tasks.push(tuple);
        if (_this.tasks.length > 0) {
          return _this.callback.call(_this, tuple);
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
          return _this.callback.call(_this, tuple);
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
      ts = task.unicast === true ? this.uni : this.group;
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

  })();

  module.exports = Client;

}).call(this);
