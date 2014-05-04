(function() {
  var Crypto, DeviceModel, Group, GroupModel, Manager, User, UserModel, mongoose, _;

  mongoose = require("mongoose");

  mongoose.connect("mongodb://localhost/babascript/manager");

  _ = require("underscore");

  Crypto = require("crypto");

  Manager = (function() {
    Manager.prototype.isAuthenticate = false;

    Manager.prototype.user = null;

    function Manager() {}

    Manager.prototype.authenticate = function(username, password, callback) {
      var pass;
      this.username = username;
      this.password = password;
      if (!this.username) {
        throw new Error("username is undefined");
      }
      if (!this.password) {
        throw new Error("password is undefined");
      }
      if (this.isAuthenticate) {
        return "authenticated";
      }
      pass = Crypto.createHash("sha256").update(this.password).digest("hex");
      return UserModel.findOne({
        username: username,
        password: pass
      }, (function(_this) {
        return function(err, user) {
          if (err) {
            throw err;
          }
          if (user == null) {
            return callback(false);
          }
          _this.isAuthenticate = true;
          _this.user = user;
          return callback(true);
        };
      })(this));
    };

    Manager.prototype.listen = function(io, server) {};

    Manager.prototype.getUser = function() {
      if ((this.user == null) || !this.isAuthenticate) {
        return false;
      }
      return this.user;
    };

    Manager.prototype.getGroup = function() {};

    return Manager;

  })();

  User = (function() {
    User.prototype.isAuthenticate = false;

    User.prototype.data = {};

    function User() {}

    User.find = function(username, callback) {
      var u;
      if (!username) {
        throw new Error("username is undefined");
      }
      u = new User();
      return UserModel.findOne({
        username: username
      }, (function(_this) {
        return function(err, user) {
          if (err) {
            throw err;
          }
          u.data = user;
          if (!user) {
            return callback(null);
          }
          return callback(u);
        };
      })(this));
    };

    User.authenticate = function(username, password, callback) {
      if (!username) {
        throw new Error("username is undefined");
      }
      if (!password) {
        throw new Error("password is undefined");
      }
      return UserModel.findOne({
        username: username,
        password: password
      }, (function(_this) {
        return function(err, user) {
          var u;
          if (err) {
            throw err;
          }
          u = new User();
          u.isAuthenticate = true;
          u.data = user;
          if (!user) {
            return callback(null);
          }
          return callback(u);
        };
      })(this));
    };

    User.create = function(username, password, callback) {
      if (!username) {
        throw new Error("username is undefined");
      }
      if (!password) {
        throw new Error("password is undefined");
      }
      return UserModel.findOne({
        username: username
      }, function(err, user) {
        var pass, u;
        if (err) {
          throw err;
        }
        if (!user) {
          return callback(false);
        }
        u = new User();
        pass = Crypto.createHash("sha256").update(password).digest("hex");
        u.data = new UserModel();
        u.data.username = username;
        u.data.password = pass;
        return callback(u);
      });
    };

    User.prototype.authenticate = function(username, password, callback) {
      if (!username) {
        throw new Error("username is undefined");
      }
      if (!password) {
        throw new Error("password is undefined");
      }
      return UserModel.findOne({
        username: username,
        password: password
      }, (function(_this) {
        return function(err, user) {
          if (err) {
            throw err;
          }
          _this.isAuthenticate = true;
          if (!user) {
            return callback(false);
          }
          return callback(_this);
        };
      })(this));
    };

    User.prototype.save = function(callback) {
      return this.data.save((function(_this) {
        return function(err) {
          if (err) {
            throw err;
          }
          return callback(_this);
        };
      })(this));
    };

    User.prototype.set = function(name, data) {
      return this.data[name] = data;
    };

    User.prototype.get = function(name) {
      return this.data[name];
    };

    User.prototype.addGroup = function(name, callback) {
      if (!this.data) {
        return callback(false);
      }
      return GroupModel.findOne({
        name: name
      }, (function(_this) {
        return function(err, group) {
          var g;
          if (err) {
            throw err;
          }
          if (!group) {
            return callback(false);
          }
          g = _.find(_this.data.groups, function(group) {
            return group.name === name;
          });
          if (!g) {
            _this.data.groups.push(group._id);
          }
          return _this.data.save(function(err) {
            var member;
            if (err) {
              throw err;
            }
            member = _.find(group.members, function(m) {
              return m._id === this.data._id;
            });
            if (!member) {
              group.members.push(this.data._Id);
            }
            return group.save(function(err) {
              if (err) {
                throw err;
              }
              return callback(this.data);
            });
          });
        };
      })(this));
    };

    User.prototype.removeGroup = function(name, callback) {
      if (!this.data || !this.username) {
        return callback(false);
      }
      return GroupModel.findOne({
        name: name
      }, function(err, group) {
        if (err) {
          throw err;
        }
        return UserModel.findOne({
          username: this.username
        }, function(err, user) {
          var i, _i, _ref;
          if (err) {
            throw err;
          }
          for (i = _i = 0, _ref = user.groups.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            if (user.groups[i].name === name) {
              user.groups.split(i, 1);
            }
          }
          return user.save(function(err) {
            if (err) {
              throw err;
            }
            return callback(true);
          });
        });
      });
    };

    User.prototype.getDevice = function(uuid, callback) {
      if (this.data) {
        return callback(this.data, this.data.device);
      } else {
        return this.find({
          username: this.username
        }, function(err, user) {
          if (err) {
            throw err;
          }
          return callback(user, user.device);
        });
      }
    };

    User.prototype.addDevice = function(device, callback) {
      return this.getDevice(device.uuid, function(user, device) {
        if (device) {
          return true;
        }
        device = new DeviceModel();
        device.uuid = device.uuid;
        device.type = device.type;
        device.token = device.token;
        device.endpoint = device.endpoint;
        device.owner = user._id;
        return device.save(function(err) {
          if (err) {
            throw err;
          }
          user.device = device;
          return user.save(function(err) {
            if (err) {
              throw err;
            }
            return callback(device);
          });
        });
      });
    };

    User.prototype.removeDevice = function(uuid, callback) {
      return this.getDevice(uuid, function(user, device) {
        if (!device) {
          return false;
        }
        user.device = null;
        return user.save(function(err) {
          if (err) {
            throw err;
          }
          return callback(true);
        });
      });
    };

    return User;

  })();

  Group = (function() {
    Group.prototype.data = {};

    function Group() {}

    Group.create = function(name, callback) {
      if (!name) {
        throw new Error("name is undefined");
      }
      return GroupModel.findOne({
        name: name
      }, function(err, group) {
        if (err) {
          throw err;
        }
        if (group) {
          return callback(false);
        }
        group = new Group();
        group.data = new GroupModel();
        group.data.name = name;
        return group;
      });
    };

    Group.find = function(name, callback) {
      var g;
      if (!name) {
        throw new Error("name is undefined");
      }
      g = new Group();
      return GroupModel.findOne({
        name: name
      }, function(err, group) {
        if (err) {
          throw err;
        }
        g.data = group;
        if (!group) {
          return callback(null);
        }
        return callback(g);
      });
    };

    Group.prototype.get = function(name) {
      return this.data[name];
    };

    Group.prototype.fetch = function(callback) {
      if (!this.groupname || !this.data) {
        return false;
      }
      return GroupModel.findOne({
        name: this.groupname
      }, (function(_this) {
        return function(err, group) {
          if (err) {
            throw err;
          }
          if (!group) {
            callback(false);
          }
          _this.data.name = group.name;
          _this.data.members = group.members;
          return callback(_this.data);
        };
      })(this));
    };

    Group.prototype["delete"] = function(callback) {
      return GroupModel.findOne({
        name: this.get("name")
      }, function(err, group) {
        if (err) {
          throw err;
        }
        if (!group) {
          callback(false);
        }
        group.remove();
        return callback(true);
      });
    };

    Group.prototype.save = function(callback) {
      return this.data.save((function(_this) {
        return function(err) {
          if (err) {
            throw err;
          }
          return callback(_this);
        };
      })(this));
    };

    Group.prototype.addMember = function(name, callback) {
      if (!name) {
        throw new Error("name is undefined");
      }
      return UserModel.findOne({
        username: name
      }, (function(_this) {
        return function(err, user) {
          var member;
          if (err) {
            throw err;
          }
          if (!user) {
            return callback(null);
          }
          member = _.find(_this.data.members, function(m) {
            return m.toString() === user._id.toString();
          });
          if (!member) {
            _this.data.members.push(user._id);
          }
          return _this.data.save(function(err) {
            var group, id;
            if (err) {
              throw err;
            }
            id = _this.data._id;
            group = _.find(user.groups, function(group) {
              return group.toString() === id;
            });
            if (!group) {
              user.groups.push(id);
            }
            return user.save(function(err) {
              if (err) {
                throw err;
              }
              return callback(this.data);
            });
          });
        };
      })(this));
    };

    Group.prototype.removeMember = function(name, callback) {
      if (!name) {
        throw new Error("name is undefined");
      }
      return UserModel.findOne({
        username: name
      }, (function(_this) {
        return function(err, user) {
          var data, flag, i, _i, _ref;
          if (err) {
            throw err;
          }
          if (!user) {
            return callback(null);
          }
          flag = false;
          for (i = _i = 0, _ref = _this.data.members.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            if (_this.data.members[i].toString() === user._id.toString()) {
              _this.data.members.splice(i, 1);
              break;
            }
          }
          data = _this.data;
          return _this.data.save(function(err) {
            var _j, _ref1;
            if (err) {
              throw err;
            }
            console.log("save!");
            for (i = _j = 0, _ref1 = user.groups.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
              if (user.groups[i].toString() === data._id.toString()) {
                user.groups.splice(i, 1);
                break;
              }
            }
            return user.save(function(err) {
              if (err) {
                throw err;
              }
              return callback(data);
            });
          });
        };
      })(this));
    };

    Group.prototype.getMembers = function(callback) {
      var q;
      q = GroupModel.findOne({
        name: this.data.name
      });
      q.populate("members", "username device");
      return q.exec(function(err, group) {
        if (err) {
          throw err;
        }
        return callback(group.members);
      });
    };

    return Group;

  })();

  UserModel = mongoose.model("user", new mongoose.Schema({
    username: {
      type: String
    },
    password: {
      type: String
    },
    device: {
      type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "device"
      }
    },
    groups: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "group"
        }
      ]
    }
  }));

  GroupModel = mongoose.model("group", new mongoose.Schema({
    name: {
      type: String
    },
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        }
      ]
    }
  }));

  DeviceModel = mongoose.model("device", new mongoose.Schema({
    uuid: {
      type: String
    },
    type: {
      type: String
    },
    token: {
      type: String
    },
    endpoint: {
      type: String
    },
    owner: {
      type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    }
  }));

  module.exports = {
    User: User,
    Group: Group,
    Manager: Manager
  };

}).call(this);
