(function() {
  var Client, Script, Virtual, createClient;

  Script = require("../lib/script");

  Client = require("../lib/client");

  Virtual = require("../lib/virtualbaba");

  createClient = function(name) {
    return new Client(name);
  };

  module.exports = {
    Script: Script,
    Client: Client,
    Manager: require("../lib/manager"),
    Virtual: Virtual,
    createClient: createClient
  };

}).call(this);
