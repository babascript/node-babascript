(function() {
  var Client, Manager, Script, createClient;

  Script = require("../lib/script");

  Client = require("../lib/client");

  Manager = require("../lib/manager");

  createClient = function(name) {
    return new Client(name);
  };

  module.exports = {
    Script: Script,
    Client: Client,
    Manager: Manager,
    createClient: createClient
  };

}).call(this);
