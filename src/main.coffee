Script = require "../lib/script"
Client = require "../lib/client"
Virtual = require "../lib/virtualbaba"

createClient = (name)->
  return new Client(name)

module.exports =
  Script: Script
  Client: Client
  Manager: require "../lib/manager"
  createClient: createClient