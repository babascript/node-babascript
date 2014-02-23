(function() {
  var Client, EventEmitter, LindaSocketIOClient, SocketIOClient,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require("EventEmitter2").EventEmitter2;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  Client = (function(_super) {
    __extends(Client, _super);

    function Client(name) {
      var options, socket;
      this.name = name;
      options = {
        'force new connection': true
      };
      socket = SocketIOClient.connect("http://linda.babascript.org/", options);
      this.linda = new LindaSocketIOClient().connect(socket);
      this.tasks = [];
      this.id = this.getId();
      if (socket.socket.connecting != null) {
        this.connect();
      } else {
        this.linda.io.once("connect", this.connect);
      }
      return this;
    }

    Client.prototype.connect = function() {
      this.group = this.linda.tuplespace(this.name);
      this.next();
      this.broadcast();
      this.unicast();
      return this.watchAliveCheck();
    };

    Client.prototype.next = function() {
      var format, task,
        _this = this;
      if (this.tasks.length > 0) {
        task = this.tasks[0];
        format = task.format;
        return this.emit("get_task", task);
      } else {
        return this.group.take({
          baba: "script",
          type: "eval"
        }, function(err, tuple) {
          if (err) {
            return err;
          }
          _this.tasks.push(tuple.data);
          if (_this.tasks.length > 0) {
            return _this.emit("get_task", tuple.data);
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
      return this.group.watch(t, function(err, tuple) {
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
      return this.group.watch(t, function(err, tuple) {
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
      }, function(err, tple) {
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
      var task, tuple;
      if (options == null) {
        options = {};
      }
      task = this.tasks[0];
      tuple = {
        baba: "script",
        type: "return",
        value: value,
        cid: task.cid,
        worker: this.id,
        options: options
      };
      this.group.write(tuple);
      this.tasks.shift();
      return this.next();
    };

    Client.prototype.watchAliveCheck = function() {
      var _this = this;
      return this.group.watch({
        baba: "script",
        type: "aliveCheck"
      }, function(err, tuple) {
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
