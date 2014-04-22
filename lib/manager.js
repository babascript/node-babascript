(function() {
  var Group, GroupModel, Manager, User, UserModel, group, i, mongoose, _, _i, _len, _ref;

  mongoose = require("mongoose");

  mongoose.connect("mongodb://localhost/babascript/manager");

  _ = require("underscore");

  Manager = (function() {
    function Manager() {}

    Manager.prototype.getUser = function(username) {
      var user;
      return user = new User(username);
    };

    Manager.prototype.getGroup = function(groupname) {};

    return Manager;

  })();

  User = (function() {
    User.prototype.data = {};

    function User(username) {
      this.username = username;
    }

    User.prototype.find = function(callback) {
      if (!this.username) {
        return false;
      }
      return UserModel.findOne({
        username: this.username
      }, (function(_this) {
        return function(err, user) {
          if (err) {
            throw err;
          }
          return callback(user);
        };
      })(this));
    };

    User.prototype.save = function() {
      if (!this.username) {
        return false;
      }
      return this.find(function(user) {
        var key, value, _ref;
        if (!user) {
          user = new UserModel();
        }
        user[username] = this.username;
        _ref = this.data;
        for (key in _ref) {
          value = _ref[key];
          user[key] = value;
        }
        return user.save((function(_this) {
          return function(err) {
            if (err) {
              throw err;
            }
            return true;
          };
        })(this));
      });
    };

    User.prototype.set = function(name, data) {
      return this.data[name] = data;
    };

    User.prototype.get = function(name) {
      return this.data[name];
    };

    return User;

  })();

  Group = (function() {
    Group.prototype.data = {};

    Group.prototype.members = [];

    function Group(groupname) {
      this.groupname = groupname;
    }

    Group.prototype.find = function(callback) {
      if (!this.groupname) {
        return false;
      }
      return GroupModel.findOne({
        name: this.groupname
      }, function(err, group) {
        if (err) {
          throw err;
        }
        return callback(group);
      });
    };

    Group.prototype.save = function() {
      if (this.groupname) {
        return false;
      }
      return this.find(function(group) {
        if (!group) {
          return group = new GroupModel();
        }
      });
    };

    Group.prototype.addMember = function(name) {
      return this.members.push(membername);
    };

    Group.prototype.removeMember = function(membername) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.members.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this.members[i] === membername) {
          _results.push(this.members.splice(i, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
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

  i = new User("baba");

  group = new Group("g");

  _ref = ["a", "b", "c"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    i = _ref[_i];
    group.addMember(i);
  }

  console.log(group.members);

  group.removeMember("b");

  console.log(group.members);

}).call(this);
