debug = require('debug')('babascript:plugin')

module.exports = class Plugins
  constructor: ->
    @loadings = []
    @plugins = {}

  set: (name, plugin) ->
    @loadings.push
      name: name
      body: plugin
    @__set()

  __set: ->
    return if @loadings.length is 0
    plugin = @loadings.shift()
    name = plugin.name
    plugin.body.load @, =>
      @plugins[name] = plugin
      @__set()

  connect: ->
    debug 'connect'
    for name, plugin of @plugins
      plugin.body?.connect()

  send: ->
    debug 'send'
    for name, plugin of @plugins
      plugin.body?.send()

  receive: ->
    debug 'receive'
    for name, plugin of @plugins
      plugin.body?.receive()

  return_value: ->
    debug 'return value'
    for name, plugin of @plugins
      plugin.body?.return_value()
