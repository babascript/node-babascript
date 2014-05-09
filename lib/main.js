(function() {
  var Client, Manager, ManagerClient, Script, createClient;

  Script = require("../lib/script");

  Client = require("../lib/client");

  Manager = require("../lib/manager");

  ManagerClient = require("../lib/managerclient");

  createClient = function(name) {
    return new Client(name);
  };

  module.exports = {
    Script: Script,
    Client: Client,
    Manager: Manager,
    ManagerClient: ManagerClient,
    createClient: createClient
  };

}).call(this);
