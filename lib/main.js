(function() {
  var Client, Script, createClient;

  Script = require("../lib/script");

  Client = require("../lib/client");

  createClient = function(name) {
    return new Client(name);
  };

  module.exports = {
    Script: Script,
    Client: Client,
    createClient: createClient
  };

}).call(this);
