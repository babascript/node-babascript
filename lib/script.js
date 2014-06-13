(function() {
  var BabaScript, BabaScriptBase, Client, EventEmitter, LindaSocketIOClient, SocketIOClient, UserAttribute, UserEvents, Util, async, http, mm, moment, request, sys, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mm = require('methodmissing');

  http = require('http');

  Util = require('util');

  request = require('superagent');

  EventEmitter = require("events").EventEmitter;

  LindaSocketIOClient = require("linda-socket.io").Client;

  SocketIOClient = require("socket.io-client");

  Client = require("babascript-client");

  moment = require("moment");

  sys = require("sys");

  _ = require("lodash");

  async = require("async");

  BabaScriptBase = (function(_super) {
    __extends(BabaScriptBase, _super);

    BabaScriptBase.prototype.linda = null;

    BabaScriptBase.prototype.isProcessing = false;

    BabaScriptBase.prototype.defaultFormat = 'boolean';

    BabaScriptBase.prototype.id = '';

    BabaScriptBase.create = function(id, options) {
      if (options == null) {
        options = {};
      }
      return new BabaScript(id, options);
    };

    BabaScriptBase.getLinda = function(_api) {
      var api, socket;
      api = _api || 'http://linda.babascript.org';
      socket = SocketIOClient.connect(api, {
        'force new connection': true
      });
      return new LindaSocketIOClient().connect(socket);
    };

    function BabaScriptBase(id, options) {
      var socket, _ref;
      this.options = options != null ? options : {};
      this.getWorker = __bind(this.getWorker, this);
      this.addResult = __bind(this.addResult, this);
      this.cancel = __bind(this.cancel, this);
      this.removeMember = __bind(this.removeMember, this);
      this.addMember = __bind(this.addMember, this);
      this.connect = __bind(this.connect, this);
      if (_.isArray(id)) {
        this.options.users = id;
        this.id = id.join(":");
      } else {
        if (id === '') {
          id = this.callbackId();
        }
        this.options.users = [id];
        this.id = id;
      }
      this.api = ((_ref = this.options) != null ? _ref.manager : void 0) || 'http://linda.babascript.org';
      socket = SocketIOClient.connect(this.api, {
        'force new connection': true
      });
      if (this.linda == null) {
        this.linda = new LindaSocketIOClient().connect(socket);
      }
      this.attributes = new UserAttribute(this.linda);
      this.sts = this.linda.tuplespace(this.id);
      this.membersData = [];
      this.tasks = [];
      this.broadcastTasks = [];
      this.events = new UserEvents();
      EventEmitter.call(this.events);
      this.linda.io.once("connect", this.connect);
      return this;
    }

    BabaScriptBase.prototype.connect = function() {
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
        if (((_ref2 = this.options) != null ? _ref2.users : void 0) != null) {
          _ref3 = this.options.users;
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            user = _ref3[_i];
            if (user === this.id) {
              return;
            }
            u = {
              username: user
            };
            this.vclients.push(this.createMediator(u));
          }
        }
        return setImmediate((function(_this) {
          return function() {
            _this.next();
            _this.watchCancel();
            return _this.events.emit("ready go");
          };
        })(this));
      } else {
        return request.get("" + host + ":" + port + "/api/group/" + this.id + "/member").end((function(_this) {
          return function(err, res) {
            var member, members, names, userAttribute, _j, _k, _len1, _len2, _ref4;
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
                userAttribute = new UserAttribute(_this.linda);
                userAttribute.__syncStart(member);
                _this.membersData.push(userAttribute);
                _this.vclients.push(_this.createMediator(member));
              }
              return setImmediate(function() {
                _this.events.emit("ready go");
                _this.next();
                return _this.watchCancel();
              });
            } else {
              names = _options.users != null ? _options.users : _this.id;
              return request.get("" + host + ":" + port + "/api/users").send({
                names: names
              }).end(function(err, res) {
                var d, _l, _len3, _ref5;
                if ((res != null ? res.statusCode : void 0) === 200) {
                  _ref5 = res.body;
                  for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
                    u = _ref5[_l];
                    userAttribute = new UserAttribute(_this.linda);
                    d = {
                      username: u.username,
                      attribute: u.attribute
                    };
                    userAttribute.__syncStart(d);
                    _this.vclients.push(_this.createMediator(d));
                    _this.membersData.push(userAttribute);
                  }
                }
                return setImmediate(function() {
                  _this.next();
                  _this.watchCancel();
                  return _this.events.emit("ready go");
                });
              });
            }
          };
        })(this));
      }
    };

    BabaScriptBase.prototype.next = function() {
      if (this.tasks.length > 0) {
        this.task = this.tasks.shift();
        return this.humanExec(this.task.key, this.task.args);
      }
    };

    BabaScriptBase.prototype.exec = function(key, arg, func) {
      var args;
      args = [arg, func];
      this._do(key, args);
      return args;
    };

    BabaScriptBase.prototype._do = function(key, args) {
      args.cid = this.callbackId();
      this.tasks.push({
        key: key,
        args: args
      });
      this.next();
      return args.cid;
    };

    BabaScriptBase.prototype.addMember = function(name) {
      var host, port, u, _i, _len, _ref, _ref1;
      console.log(this.id);
      console.log('add member');
      _ref = this.vclients;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        if (u.data.username === name) {
          return;
        }
      }
      _ref1 = this.linda.io.socket.options, host = _ref1.host, port = _ref1.port;
      return request.get("" + host + ":" + port + "/api/user/" + name).end((function(_this) {
        return function(err, res) {
          var d, user, userAttribute;
          if (res.statusCode === 200) {
            user = res.body;
            console.log('-------');
            console.log(user);
            console.log('-------');
            _this.vclients.push(_this.createMediator(user));
            userAttribute = new UserAttribute(_this.linda);
            d = {
              username: user.username,
              attribute: user.attribute
            };
            userAttribute.__syncStart(d);
            return _this.membersData.push(userAttribute);
          } else {
            _this.vclients.push(_this.createMediator({
              username: name
            }));
            return console.log(_this.vclients);
          }
        };
      })(this));
    };

    BabaScriptBase.prototype.removeMember = function(name) {
      var i, v, _i, _len, _ref, _results;
      _ref = this.vclients;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        if (v.mediator.name === name) {
          v.linda.io.socket.disconnect();
        }
        _results.push(delete this.vclients[i]);
      }
      return _results;
    };

    BabaScriptBase.prototype.methodmissing = function(key, args) {
      if (key === "inspect") {
        return sys.inspect(this);
      }
      args.callback = args[args.length - 1];
      return this._do(key, args);
    };

    BabaScriptBase.prototype.humanExec = function(key, args) {
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
            if (err) {
              throw err;
            }
            cid = results[0].task.cid;
            _this.sts.take({
              type: 'broadcast',
              cid: cid
            }, function() {
              _this.cancel(cid);
              _this.emit("" + cid + "_callback", results);
              _this.broadcastTasks = [];
              return _this.next();
            });
            _this.isProcessing = false;
            return _this.task = null;
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

    BabaScriptBase.prototype.createTupleWithOption = function(key, cid, option) {
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
                _this.cancel(cid, _this.broadcastTasks);
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

    BabaScriptBase.prototype.cancel = function(cid, value) {
      if (value == null) {
        value = {
          error: 'cancel'
        };
      }
      return this.sts.write({
        baba: "script",
        type: "cancel",
        cid: cid,
        value: value
      });
    };

    BabaScriptBase.prototype.watchCancel = function() {
      return this.sts.watch({
        baba: "script",
        type: "cancel"
      }, (function(_this) {
        return function(err, tuple) {
          var a, cid, i, result, v, vv, _i, _j, _len, _ref, _ref1, _ref2, _results;
          if (err) {
            throw err;
          }
          cid = tuple.data.cid;
          v = tuple.data.value;
          if ((v != null) && _.isArray(v)) {
            for (_i = 0, _len = v.length; _i < _len; _i++) {
              vv = v[_i];
              if (!vv.__worker) {
                return;
              }
              a = function(id) {
                return _this.getWorker(id);
              };
              vv.getWorker = _.bind(a, {}, vv.__worker);
            }
          }
          if (tuple.data.value != null) {
            result = v;
          } else {
            result = {
              value: v
            };
          }
          if (((_ref = _this.task) != null ? (_ref1 = _ref.args) != null ? _ref1.cid : void 0 : void 0) === cid) {
            _this.task.args.callback(result);
            _this.task = null;
            _this.isProcessing = false;
            _this.next();
            return;
          }
          if (_this.tasks.length === 0) {
            return;
          }
          _results = [];
          for (i = _j = 0, _ref2 = _this.tasks.length - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
            if (_this.tasks[i].args.cid === cid) {
              _this.tasks[i].args.callback(result);
              _results.push(_this.tasks.splice(i, 1));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    };

    BabaScriptBase.prototype.waitReturn = function(cid, callback) {
      return this.sts.take({
        baba: "script",
        type: "return",
        cid: cid
      }, (function(_this) {
        return function(err, tuple) {
          var options, result, worker, _ref;
          if (err === "cancel") {
            return callback.call(_this, {
              value: "cancel"
            });
          }
          if (((_ref = tuple.value) != null ? _ref.error : void 0) != null) {
            console.log('this is throw error message');
          }
          options = _this.options;
          worker = tuple.data.worker;
          result = {
            value: tuple.data.value,
            task: tuple.data._task,
            __worker: tuple.data.worker,
            getWorker: function() {
              options.child = true;
              if (tuple.data.worker === this.id) {
                return this.__self;
              } else {
                return new BabaScript(tuple.data.worker, options || {});
              }
            }
          };
          return callback.call(_this, result);
        };
      })(this));
    };

    BabaScriptBase.prototype.addResult = function(cid, callback) {
      return this.waitReturn(cid, (function(_this) {
        return function(r) {
          _this.broadcastTasks.push(r);
          return callback(null, r);
        };
      })(this));
    };

    BabaScriptBase.prototype.getWorker = function(id) {
      var options;
      options = this.options;
      options.child = true;
      if (id === this.id) {
        return this.__self;
      } else {
        return new BabaScript(id, options || {});
      }
    };

    BabaScriptBase.prototype.callbackId = function() {
      return "" + (moment().unix()) + "_" + (Math.random(1000000));
    };

    BabaScriptBase.prototype.createMediator = function(member) {
      var c;
      c = new Client(this.id, this.options || {});
      c.data = member;
      c.mediator = c.linda.tuplespace(member.username);
      c.watchCancel = function() {
        return this.group.watch({
          baba: "script",
          type: "cancel"
        }, (function(_this) {
          return function(err, tuple) {
            return _this.mediator.write(tuple.data);
          };
        })(this));
      };
      c.on("get_task", function(result) {
        var report, type, _ref, _ref1;
        result.taked = 'virtual';
        if (result.type === 'broadcast') {
          result.type = 'eval';
          result.oldtype = 'broadcast';
        }
        if ((((_ref = this.options) != null ? _ref.hubot : void 0) != null) && (this.hubot == null)) {
          type = this.options.hubot;
          this.hubot = this.mediator.linda.tuplespace('waiting_hubot');
          this.hubot.write({
            baba: "script",
            type: "connect",
            id: this.mediator.name
          });
          if (type === 'mail') {
            result.to = ((_ref1 = this.data.attribute) != null ? _ref1.mail : void 0) || "s09704tb@gmail.com";
            console.log(result);
          }
        }
        report = {
          baba: 'script',
          type: 'report',
          value: 'taked',
          tuple: result
        };
        this.mediator.write(report);
        this.mediator.write(result);
        return this.mediator.take({
          cid: result.cid,
          type: 'return'
        }, (function(_this) {
          return function(err, r) {
            _this.returnValue(r.data.value, {
              worker: _this.mediator.name
            });
            if (_this.hubot != null) {
              _this.hubot.write({
                baba: 'script',
                type: 'disconnect',
                id: _this.mediator.name
              });
              return _this.hubot = null;
            }
          };
        })(this));
      });
      c.on("cancel_task", function(result) {
        console.log('mediator cancel');
        console.log(result);
        return this.mediator.write(result);
      });
      return c;
    };

    return BabaScriptBase;

  })(EventEmitter);

  UserEvents = (function(_super) {
    __extends(UserEvents, _super);

    function UserEvents() {
      return UserEvents.__super__.constructor.apply(this, arguments);
    }

    return UserEvents;

  })(EventEmitter);

  UserAttribute = (function(_super) {
    __extends(UserAttribute, _super);

    UserAttribute.prototype.data = {};

    UserAttribute.prototype.isSyncable = false;

    function UserAttribute(linda) {
      this.linda = linda;
      this.sync = __bind(this.sync, this);
      UserAttribute.__super__.constructor.call(this);
    }

    UserAttribute.prototype.get = function(key) {
      if (key == null) {
        return;
      }
      return this.data[key];
    };

    UserAttribute.prototype.__syncStart = function(attr) {
      var key, value, __data;
      if (attr == null) {
        return;
      }
      this.name = attr.username;
      __data = null;
      for (key in attr) {
        value = attr[key];
        if (this.get(key) == null) {
          this.set(key, value);
        } else {
          if (__data == null) {
            __data = {};
          }
          __data[key] = value;
        }
      }
      this.isSyncable = true;
      this.emit("get_data", this.data);
      this.ts = this.linda.tuplespace(this.name);
      this.ts.watch({
        type: 'userdata'
      }, (function(_this) {
        return function(err, result) {
          var username, _ref;
          if (err) {
            return;
          }
          _ref = result.data, key = _ref.key, value = _ref.value, username = _ref.username;
          if (username === _this.name) {
            if (_this.get(key) !== value) {
              _this.set(key, value);
              return _this.emit("change_data", _this.data);
            }
          }
        };
      })(this));
      if (__data != null) {
        for (key in __data) {
          value = __data[key];
          this.sync(key, value);
        }
        return __data = null;
      }
    };

    UserAttribute.prototype.sync = function(key, value) {
      return this.ts.write({
        type: 'update',
        key: key,
        value: value
      });
    };

    UserAttribute.prototype.set = function(key, value, options) {
      if (options == null) {
        options = {
          sync: false
        };
      }
      if ((key == null) || (value == null)) {
        return;
      }
      if ((options != null ? options.sync : void 0) && this.isSyncable === true) {
        if (this.get(key) !== value) {
          return this.sync(key, value);
        }
      } else {
        return this.data[key] = value;
      }
    };

    return UserAttribute;

  })(EventEmitter);

  module.exports = BabaScript = (function(_super) {
    __extends(BabaScript, _super);

    function BabaScript(id, options) {
      BabaScript.__super__.constructor.call(this, id, options);
      this.__self = mm(this, (function(_this) {
        return function(key, args) {
          return _this.methodmissing(key, args);
        };
      })(this));
      return this.__self;
    }

    return BabaScript;

  })(BabaScriptBase);

}).call(this);
