debug = require('debug')('babascript:plugin')

module.exports = class Plugins
  constructor: (@baba) ->
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
    plugin.body.load @baba, =>
      @plugins[name] = plugin
      @__set()

  connect: ->
    debug 'connect'
    for name, plugin of @plugins
      plugin.body?.connect()

  send: (data) ->
    debug 'send'
    for name, plugin of @plugins
      plugin.body?.send data

  receive: (data) ->
    debug 'receive'
    for name, plugin of @plugins
      plugin.body?.receive data

  return_value: (data) ->
    debug 'return value'
    for name, plugin of @plugins
      plugin.body?.return_value data
