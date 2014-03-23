Script  = require "../lib/script"
Client  = require "../lib/client"
Manager = require "../lib/manager"

createClient = (name)->
  return new Client(name)

module.exports =
  Script: Script
  Client: Client
  Manager: Manager
  createClient: createClient