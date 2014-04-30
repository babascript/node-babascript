(function() {
  var API, Client, Request, VC;

  Request = require("request");

  Client = require("./client");

  API = "http://linda.babascript.org";

  VC = (function() {
    VC.prototype.users = [];

    function VC(groupName) {
      this.groupName = groupName;
      this.getUsers();
    }

    VC.prototype.getUsers = function() {
      var option, res, u, _i, _len, _results;
      option = {
        url: "" + API + "/group/" + this.groupName + "/member"
      };
      this.users = [];
      res = [
        {
          id: "baba"
        }, {
          id: "usuki"
        }, {
          id: "nakazono"
        }
      ];
      _results = [];
      for (_i = 0, _len = res.length; _i < _len; _i++) {
        u = res[_i];
        _results.push(this.createClient(u));
      }
      return _results;
    };

    VC.prototype.createClient = function(user) {
      var c;
      c = new Client(this.groupName);
      c.id = user.id;
      if (user.sid != null) {
        c.type = "web";
      } else {
        c.type = "mobile";
      }
      c.status = c.linda.tuplespace(this.groupName);
      c.mediator = c.linda.tuplespace(user.id);
      c.on("get_task", this.getTask);
      c.on("cance_task", this.cancelTask);
      c.mediator.read({
        type: "status"
      }, (function(_this) {
        return function(err, result) {
          if (err) {
            throw err;
          }
          _this.statusCheck(result);
          return c.mediator.watch({
            type: "status"
          }, _this.statusCheck);
        };
      })(this));
      return this.users.push(c);
    };

    VC.prototype.getTask = function(result) {
      var option;
      console.log("get task!!");
      console.log(result);
      this.mediator.write(result);
      this.mediator.take({
        cid: result.cid,
        type: "return"
      }, (function(_this) {
        return function(err, r) {
          console.log(r.data.value);
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

    VC.prototype.cancelTask = function(result) {};

    VC.prototype.statusCheck = function(err, result) {
      console.log("status");
      return console.log(result);
    };

    return VC;

  })();

  module.exports = VC;

}).call(this);
