(function() {
  var Client, Manager, Script, VC, createClient;

  Script = require("../lib/script");

  Client = require("../lib/client");

  Manager = require("../lib/manager");

  VC = require("../lib/vc");

  createClient = function(name) {
    return new Client(name);
  };

  module.exports = {
    Script: Script,
    Client: Client,
    Manager: Manager,
    VC: VC,
    createClient: createClient
  };

}).call(this);
