(function() {
  var BabaScript, Client, EventEmitter, LindaSocketIOClient, SocketIOClient, UserDataMediator, Util, async, http, mm, moment, request, sys, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  mm = require('methodmissing');

  http = require('http');

  Util = require('util');

  request = require('superagent');

  EventEmitter = require("EventEmitter2").EventEmitter2;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  Client = require("../../node-babascript-client/lib/client");

  moment = require("moment");

  sys = require("sys");

  _ = require("lodash");

  async = require("async");

  UserDataMediator = (function(_super) {
    __extends(UserDataMediator, _super);

    function UserDataMediator() {
      return UserDataMediator.__super__.constructor.apply(this, arguments);
    }

    return UserDataMediator;

  })(EventEmitter);

  module.exports = BabaScript = (function(_super) {
    __extends(BabaScript, _super);

    BabaScript.prototype.linda = null;

    BabaScript.prototype.isProcessing = false;

    BabaScript.prototype.defaultFormat = 'boolean';

    BabaScript.prototype.id = '';

    BabaScript.create = function(id, options) {
      if (options == null) {
        options = {};
      }
      return new BabaScript(id, options);
    };

    function BabaScript(id, options) {
      var socket, _ref, _ref1;
      this.options = options != null ? options : {};
      this.addResult = __bind(this.addResult, this);
      this.cancel = __bind(this.cancel, this);
      this.connect = __bind(this.connect, this);
      if (_.isArray(id)) {
        this.options.users = id;
        this.id = this.callbackId();
      } else {
        this.id = id;
      }
      this.parent = ((_ref = this.options) != null ? _ref.parent : void 0) || null;
      this.attributes = {};
      this.api = ((_ref1 = this.options) != null ? _ref1.manager : void 0) || 'http://linda.babascript.org';
      socket = SocketIOClient.connect(this.api, {
        'force new connection': true
      });
      if (this.linda == null) {
        this.linda = new LindaSocketIOClient().connect(socket);
      }
      this.sts = this.linda.tuplespace(this.id);
      this.tasks = [];
      this.events = new UserDataMediator();
      this.linda.io.once("connect", this.connect);
      this.__self = mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodmissing(key, args);
        };
      })(this));
      return this.__self;
    }

    BabaScript.prototype.inspect = function() {
      return this;
    };

    BabaScript.prototype.connect = function() {
      var host, port, u, user, _i, _len, _options, _ref, _ref1, _ref2, _ref3;
      _ref = this.linda.io.socket.options, host = _ref.host, port = _ref.port;
      this.vclients = [];
      this.workers = [];
      if (this.options.child === true) {
        return setImmediate((function(_this) {
          return function() {
            _this.next();
            return _this.watchCancel();
          };
        })(this));
      }
      _options = _.clone(this.options);
      _options.child = true;
      if (((_ref1 = this.options) != null ? _ref1.manager : void 0) == null) {
        this.workers = [];
        if (((_ref2 = this.options) != null ? _ref2.users : void 0) == null) {
          _options.users = [this.id];
        }
        _ref3 = _options.users;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          user = _ref3[_i];
          u = {
            username: user
          };
          this.vclients.push(this.createMediator(u));
        }
        return setImmediate((function(_this) {
          return function() {
            _this.next();
            return _this.watchCancel();
          };
        })(this));
      } else {
        return request.get("" + host + ":" + port + "/api/group/" + this.id + "/member").end((function(_this) {
          return function(err, res) {
            var member, members, t, users, _j, _k, _l, _len1, _len2, _len3, _ref4;
            if ((res != null ? res.statusCode : void 0) === 200) {
              members = [];
              _ref4 = res.body;
              for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
                user = _ref4[_j];
                members.push(user);
              }
              if (!_.isArray(members)) {
                members = [members];
              }
              for (_k = 0, _len2 = members.length; _k < _len2; _k++) {
                member = members[_k];
                _this.vclients.push(_this.createMediator(member));
                _this.attributes[member.username] = member;
                t = {
                  type: 'userdata'
                };
                _this.linda.tuplespace(member.username).watch(t, function(err, result) {
                  var key, username, value, _ref5;
                  if (err) {
                    return;
                  }
                  _ref5 = result.data, key = _ref5.key, value = _ref5.value, username = _ref5.username;
                  return _.each(_this.attributes, function(v, k) {
                    if (k === username) {
                      _this.attributes[k].attribute[key] = value;
                      return _this.events.emit("change_data", _this.attributes[k]);
                    }
                  });
                });
              }
            } else {
              if ((_options != null ? _options.users : void 0) == null) {
                users = [_this.id];
              } else {
                users = _options.users;
              }
              for (_l = 0, _len3 = users.length; _l < _len3; _l++) {
                u = users[_l];
                _this.vclients.push(_this.createMediator({
                  username: u
                }));
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
      if (this.tasks.length > 0) {
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
      console.log(key);
      this.tasks.push({
        key: key,
        args: args
      });
      this.next();
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
      var callback, cid, h, i, r, tuple, _i, _ref;
      this.isProcessing = true;
      cid = args.cid;
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
          h.push((function(_this) {
            return function(c) {
              return _this.addResult(cid, c);
            };
          })(this));
        }
        async.parallel(h, (function(_this) {
          return function(err, results) {
            var tt;
            if (err) {
              throw err;
            }
            _this.emit("" + cid + "_callback", results);
            _this.isProcessing = false;
            cid = _this.task.args.cid;
            tt = {
              type: 'broadcast',
              cid: cid
            };
            _this.sts.take(tt, function() {});
            _this.task = '';
            return _this.next();
          };
        })(this));
      } else {
        this.waitReturn(cid, (function(_this) {
          return function(tuple) {
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
                _this.cancel(cid);
                _this.sts.cancel(_this.cancelId);
                return _this.cancelId = '';
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
          var cid, i, _i, _ref, _ref1, _ref2, _results;
          if (err) {
            throw err;
          }
          cid = tuple.data.cid;
          if (((_ref = _this.task) != null ? (_ref1 = _ref.args) != null ? _ref1.cid : void 0 : void 0) === cid) {
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
          for (i = _i = 0, _ref2 = _this.tasks.length - 1; 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
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
          var options, result;
          if (err === "cancel") {
            return callback.call(_this, {
              value: "cancel"
            });
          }
          options = _this.options;
          result = {
            value: tuple.data.value,
            task: tuple.data._task,
            getWorker: function() {
              return new BabaScript(tuple.data.worker, options || {});
            }
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

    BabaScript.prototype.getWorker = function(id) {};

    BabaScript.prototype.callbackId = function() {
      return "" + (moment().unix()) + "_" + (Math.random(1000000));
    };

    BabaScript.prototype.createMediator = function(member) {
      var c;
      c = new Client(this.id, this.options || {});
      c.data = member;
      c.mediator = c.linda.tuplespace(member.username);
      c.mediator.watch({
        type: 'update',
        what: 'data'
      }, (function(_this) {
        return function(err, r) {
          var key;
          key = r.tuple.key;
          return c.data[key] = r.tuple.value;
        };
      })(this));
      c.on("get_task", function(result) {
        result.type = 'eval';
        this.mediator.write(result);
        return this.mediator.take({
          cid: result.cid,
          type: 'return'
        }, (function(_this) {
          return function(err, r) {
            return _this.returnValue(r.data.value, {
              worker: _this.mediator.name
            });
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
