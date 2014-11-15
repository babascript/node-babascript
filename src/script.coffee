'use strict'

mm = require 'methodmissing'
LindaAdapter = require 'babascript-linda-adapter'
EventEmitter = require('events').EventEmitter
{Promise} = require 'es6-promise'

class BabaScript extends EventEmitter
  defaultFormat: 'boolean'
  @address = ''

  constructor: (@id, @options={}) ->
    if @options.adapter?
      @adapter = @options.adapter
    else
      @adapter = new LindaAdapter BabaScriptBase.address
    @adapter.attach @
    @tasks = []
    @loadingPlugins = []
    @plugins = {}
    @data = {}
    @on "connect", @connect

  connect: ->
    for name, plugin of @plugins
      plugin.body?.connect()
    @next()

  next: ->
    if @tasks.length > 0
      task = @tasks.shift()
      @__exec task

  methodMissing: (key, args) =>
    if key is 'inspect'
      return require('sys').inspect {}, {showHidden: true, depth: 2}
    callback = args[args.length - 1]
    return @exec key, args[0], callback

  exec: (key, args, callback) =>
    cid = @callbackId()
    task =
      key: key
      options: args
      cid: cid
    @tasks.push task
    @next()
    if typeof callback isnt 'function'
      p = new Promise (resolve, reject) =>
        @once "#{cid}_callback", (data) ->
          if data.reason? then reject data else resolve data
      p.cid = cid
      return p
    else
      @once "#{cid}_callback", callback
      return cid

  __exec: (task) =>
    tuple = @createTuple task
    for name, plugin of @plugins
      module.body?.send tuple
    @adapter.receive tuple, (err, result) =>
      if Array.isArray result
        data = []
        cid = result[0].data.cid
        for r in result
          data.push r.data
      else
        cid = result.data.cid
        data = result.data
      for name, plugin of @plugins
        module.body?.receive data
      @emit "#{cid}_callback", data
      @next()
    @adapter.send tuple

  createTuple: (task) =>
    tuple =
      baba: 'script'
      name: @id
      type: 'eval'
      key: task.key
      cid: task.cid
      format: task.options?.format or 'boolean'
      at: Date.now()
      options: {}
    return tuple if typeof task.options is 'function'
    for key, value of task.options
      if key is 'broadcast'
        tuple.type = key
        tuple.count = value - 1
      else if key is 'timeout'
        setTimeout =>
          @cancel task.cid, 'timeout'
        , value
      else
        tuple.options[key] = value
    return tuple

  cancel: (cid, error) =>
    reason = if !error? then "cancel error" else error
    @adapter.cancel cid, reason

  callbackId: ->
    return "#{(new Date()/1000)}_#{Math.random(100000)}"

  set: (name, plugin) =>
    @loadingPlugins.push
      name: name
      body: plugin
    @__set()

  __set: =>
    return @next() if @loadingPlugins.length is 0
    plugin = @loadingPlugins.shift()
    name = plugin.name
    plugin.body.load @, =>
      @plugins[name] = plugin
      @__set()

module.exports = class BabaScriptBase extends BabaScript
  constructor: (id, options) ->
    super id, options
    @__self = mm @, (key, args) =>
      @methodMissing key, args
    return @__self
