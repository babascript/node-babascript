(function() {
  var Client, ManagerClient, Script, createClient;

  Script = require("../lib/script");

  Client = require("../lib/client");

  ManagerClient = require("../lib/managerclient");

  createClient = function(name) {
    return new Client(name);
  };

  module.exports = {
    Script: Script,
    Client: Client,
    ManagerClient: ManagerClient,
    createClient: createClient
  };

}).call(this);
