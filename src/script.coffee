'use strict'

LindaAdapter = require 'babascript-linda-adapter'
EventEmitter = require('events').EventEmitter
{Promise} = require 'es6-promise'
Task = require './task'

module.exports = class BabaScript extends EventEmitter
  @address = 'http://babascript-linda.herokuapp.com'

  constructor: (@id='noname', @options={}) ->
    if @options.adapter?
      @adapter = @options.adapter
    else
      @adapter = new LindaAdapter @address, {port: 80}
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
    task = new Task @id, key, args
    cid = task.get 'cid'
    @tasks.push task
    @next()
    if typeof callback isnt 'function'
      p = new Promise (resolve, reject) =>
        @once "#{cid}_callback", (err, data) ->
          if err? then reject err else resolve data
      p.cid = cid
      return p
    else
      @once "#{cid}_callback", callback
      return cid

  __exec: (task) =>
    tuple = task.toTuple()
    if tuple.timeout?
      setTimeout =>
        @cancel tuple.cid, 'timeout'
      , tuple.timeout
    for name, plugin of @plugins
      module.body?.send tuple
    @adapter.receive tuple, (err, result) =>
      if Array.isArray result
        data = []
        cid = result[0].data.cid
        for r in result
          data.push r.data
      else if result.data.reason?# and !result.data?.value?
        err = new Error result.data.reason
        cid = result.data.cid
        data = null
      else
        cid = result.data.cid
        data = result.data
      for name, plugin of @plugins
        module.body?.receive data
      @emit "#{cid}_callback", err, data
      @next()
    @adapter.send tuple

  cancel: (cid, error) =>
    reason = if !error? then "cancel" else error
    @adapter.cancel cid, reason
    @emit "#{cid}_callback", new Error reason, null

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
