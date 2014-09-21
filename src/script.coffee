mm = require 'methodmissing'
LindaAdapter = require 'babascript-linda-adapter'
EventEmitter = require('events').EventEmitter

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
    return @exec key, args, callback

  exec: (key, args, callback) =>
    if typeof callback isnt 'function'
      callback = ->
    cid = @callbackId()
    task =
      key: key
      options: args[0]
      callback: callback
      cid: cid
    @tasks.push task
    @next()
    return cid

  __exec: (task) =>
    cid = task.cid
    tuple = @createTuple task
    @once "#{cid}_callback", task.callback
    taskid = @adapter.send tuple
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

  createTuple: (task) ->
    tuple =
      baba: 'script'
      name: @id
      type: 'eval'
      key: task.key
      cid: task.cid
      format: task.options.format or @defaultFormat
      at: Date.now()
      options: {}
    return tuple if typeof task.options is 'function'
    for key, value of task.options
      if key is 'broadcast'
        tuple.type = key
        tuple.count = value - 1
      else if key is 'timeout'
        setTimeout =>
          error = new Error 'timeout'
          @cancel task.cid, error
          @emit "#{task.cid}_callback", error
        , value
      else
        tuple.options[key] = value
    return tuple

  cancel: (cid, error) =>
    reason = "cancel error" if !error?
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
