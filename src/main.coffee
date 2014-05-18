Script  = require "../lib/script"
Client  = require "../lib/client"
ManagerClient = require "../lib/managerclient"

createClient = (name)->
  return new Client(name)

module.exports =
  Script: Script
  Client: Client
  ManagerClient: ManagerClient
  createClient: createClient
