(function() {
  var API, Client, Manager, Request;

  Request = require("request");

  Client = require("./client");

  API = "http://localhost:3000/api";

  Manager = (function() {
    Manager.prototype.users = [];

    function Manager(groupName) {
      this.groupName = groupName;
      this.getUsers();
    }

    Manager.prototype.getUsers = function() {
      var option;
      option = {
        url: "" + API + "/group/" + this.groupName + "/member"
      };
      return Request.get(option, (function(_this) {
        return function(err, res, body) {
          var c, user, users, _i, _len, _results;
          console.log(body);
          if (err) {
            throw err;
          }
          users = JSON.parse(body);
          _results = [];
          for (_i = 0, _len = users.length; _i < _len; _i++) {
            user = users[_i];
            c = new Client(_this.groupName);
            c.id = user.id;
            if (user.sid != null) {
              c.type = "web";
            } else {
              c.type = "mobile";
            }
            c.status = c.linda.tuplespace(_this.groupName);
            c.mediator = c.linda.tuplespace(user.id);
            c.on("get_task", _this.getTask);
            c.on("cance_task", _this.cancelTask);
            c.mediator.read({
              type: "status"
            }, function(err, result) {
              if (err) {
                throw err;
              }
              _this.statusCheck(result);
              return c.mediator.watch({
                type: "status"
              }, _this.statusCheck);
            });
            c.mediator.watch({
              type: "notify"
            }, function(err, result) {
              var tuple;
              tuple = {
                type: "notify2",
                name: result.data.name,
                group: _this.groupName
              };
              return c.mediator.write(tuple);
            });
            _results.push(_this.users.push(c));
          }
          return _results;
        };
      })(this));
    };

    Manager.prototype.getTask = function(result) {
      var option;
      this.mediator.write(result);
      this.mediator.take({
        cid: result.cid,
        type: "return"
      }, (function(_this) {
        return function(err, r) {
          return _this.returnValue(r.data.value);
        };
      })(this));
      option = {
        method: "POST",
        uri: "" + API + "/notification/name/" + this.id,
        json: {
          userid: this.id,
          message: result
        }
      };
      return Request.post(option, (function(_this) {
        return function(err, res, body) {
          if (err) {
            throw err;
          }
        };
      })(this));
    };

    Manager.prototype.cancelTask = function(result) {};

    Manager.prototype.statusCheck = function(err, result) {
      console.log("status");
      return console.log(result);
    };

    return Manager;

  })();

  module.exports = Manager;

}).call(this);
