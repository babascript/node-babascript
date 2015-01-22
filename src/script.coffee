'use strict'

LindaAdapter = require 'babascript-linda-adapter'
EventEmitter = require('events').EventEmitter
{Promise} = require 'es6-promise'
Task = require './task'
Plugins = require './plugin'

module.exports = class BabaScript extends EventEmitter
  @address = 'http://babascript-linda.herokuapp.com'

  constructor: (@id='noname', @options={}) ->
    if @options.adapter?
      @adapter = @options.adapter
    else
      @adapter = new LindaAdapter @address, {port: 80}
    @adapter.attach @
    @tasks = []
    @plugins = new Plugins()
    @data = {}
    @on "connect", @connect

  connect: ->
    @plugins.connect()
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
    @plugins.send()
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
      @plugins.receive()
      @emit "#{cid}_callback", err, data
      @next()
    @adapter.send tuple

  cancel: (cid, reason) =>
    if reason instanceof Error
      error = reason
    else
      error = new Error reason
    @adapter.cancel cid, error
    @emit "#{cid}_callback", error, null

  set: (name, plugin) ->
    console.log 'set'
    console.log @
    @plugins.set name, plugin
