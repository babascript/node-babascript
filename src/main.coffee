Script = require "../lib/script"
Client = require "../lib/client"
Virtual = require "../lib/virtualbaba"

createClient = (name)->
  return new Client(name)

module.exports =
  Script: Script
  Client: Client
  Virtual: Virtual
  createClient: createClient