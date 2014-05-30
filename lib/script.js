(function() {
  var BabaScript, Client, EventEmitter, LindaSocketIOClient, SocketIOClient, async, http, mm, moment, request, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require('methodmissing');

  http = require('http');

  request = require('superagent');

  EventEmitter = require("EventEmitter2").EventEmitter2;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  Client = require("babascript-client");

  moment = require("moment");

  sys = require("sys");

  _ = require("underscore");

  async = require("async");

  module.exports = BabaScript = (function(_super) {
    __extends(BabaScript, _super);

    BabaScript.prototype.linda = null;

    BabaScript.prototype.isProcessing = false;

    BabaScript.prototype.defaultFormat = 'boolean';

    BabaScript.create = function(id) {
      return new BabaScript(id);
    };

    function BabaScript(id, options) {
      var socket, _ref, _ref1;
      this.id = id;
      this.options = options != null ? options : {};
      this.addResult = __bind(this.addResult, this);
      this.cancel = __bind(this.cancel, this);
      this.connect = __bind(this.connect, this);
      this.api = ((_ref = this.options) != null ? _ref.linda : void 0) || 'http://linda.babascript.org';
      this.localUsers = ((_ref1 = this.options) != null ? _ref1.localUsers : void 0) || null;
      socket = SocketIOClient.connect(this.api, {
        'force new connection': true
      });
      if (this.linda == null) {
        this.linda = new LindaSocketIOClient().connect(socket);
      }
      this.sts = this.linda.tuplespace(this.id);
      this.tasks = [];
      this.linda.io.once("connect", this.connect);
      return mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodmissing(key, args);
        };
      })(this));
    }

    BabaScript.prototype.connect = function() {
      var host, port, user, _i, _len, _ref, _ref1;
      _ref = this.linda.io.socket.options, host = _ref.host, port = _ref.port;
      if (this.localUsers != null) {
        this.workers = [];
        _ref1 = this.localUsers;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          user = _ref1[_i];
          this.workers.push(this.createMediator(user));
        }
        return setImmediate((function(_this) {
          return function() {
            _this.next();
            return _this.watchCancel();
          };
        })(this));
      } else {
        return request.get("" + host + ":" + port + "/api/group/" + this.id).end((function(_this) {
          return function(err, res) {
            var json, member, members, _j, _len1;
            if (((res != null ? res.statusCode : void 0) != null) && res.statusCode === 202) {
              json = JSON.parse(res.body);
              _this.workers = [];
              if (json.group != null) {
                members = json.group;
                for (_j = 0, _len1 = membrs.length; _j < _len1; _j++) {
                  member = membrs[_j];
                  _this.workers.push(_this.createMediator(member));
                }
              } else {
                _this.workres.push(json.user);
              }
            }
            return setImmediate(function() {
              _this.next();
              return _this.watchCancel();
            });
          };
        })(this));
      }
    };

    BabaScript.prototype.next = function() {
      if (this.tasks.length > 0 && !this.isProcessing) {
        this.task = this.tasks.shift();
        return this.humanExec(this.task.key, this.task.args);
      }
    };

    BabaScript.prototype.exec = function(key, arg, func) {
      var args;
      args = [arg, func];
      return this._do(key, args);
    };

    BabaScript.prototype._do = function(key, args) {
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

    BabaScript.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      args.callback = args[args.length - 1];
      return this._do(key, args);
    };

    BabaScript.prototype.humanExec = function(key, args) {
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

    BabaScript.prototype.createTupleWithOption = function(key, cid, option) {
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

    BabaScript.prototype.cancel = function(cid) {
      return this.sts.write({
        baba: "script",
        type: "cancel",
        cid: cid
      });
    };

    BabaScript.prototype.watchCancel = function() {
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

    BabaScript.prototype.waitReturn = function(cid, callback) {
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

    BabaScript.prototype.addResult = function(cid, callback) {
      return this.waitReturn(cid, (function(_this) {
        return function(r) {
          return callback(null, r);
        };
      })(this));
    };

    BabaScript.prototype.createWorker = function(id) {
      return new BabaScript(id, this.options || {});
    };

    BabaScript.prototype.callbackId = function() {
      return "" + (moment().unix()) + "_" + (Math.random(1000000));
    };

    BabaScript.prototype.createMediator = function(name) {
      var c;
      c = new Client(this.id, {
        linda: 'http://localhost:3030'
      });
      c.name = name;
      c.mediator = c.linda.tuplespace(name);
      c.on("get_task", function(result) {
        var url;
        console.log(result);
        url = "http://babascript-hubot-twitter.herokuapp.com/babascript/twitter/";
        url += c.name;
        result.groupname = c.id;
        result.service = c.api;
        result.key = result.key + ("" + (Date.now()));
        request.post(url).send(result).end(function(err, res) {});
        return this.mediator.take({
          cid: result.cid,
          type: 'return'
        }, (function(_this) {
          return function(err, r) {
            return _this.returnValue(r.data.value);
          };
        })(this));
      });
      c.on("cancel_task", function(result) {
        return this.mediator.write(result);
      });
      return c;
    };

    return BabaScript;

  })(EventEmitter);

}).call(this);
