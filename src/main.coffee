Script = require "../lib/script"
Client = require "../lib/client"

createClient = (name)->
  return new Client(name)

module.exports =
  Script: Script
  Client: Client
  createClient: createClient