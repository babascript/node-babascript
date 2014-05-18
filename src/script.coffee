mm = require "methodmissing"
http = require 'http'
EventEmitter = require("EventEmitter2").EventEmitter2
LindaSocketIOClient = require("linda-socket.io").Client
SocketIOClient = require "socket.io-client"
moment = require "moment"
sys = require "sys"
_ = require "underscore"
async = require "async"
ManagerClient = require "../lib/managerclient"

module.exports = class Script extends EventEmitter
  linda: null
  isProcessing: false
  defaultFormat: "boolean"
  api: "http://linda.babascript.org"

  constructor: (_id)->
    socket = SocketIOClient.connect @api
    if _id instanceof ManagerClient
      @id = _id.groupName
    else
      @id = _id
    @linda ?= new LindaSocketIOClient().connect socket
    @sts = @linda.tuplespace @id
    @tasks = []
    if @linda.io.socket.connecting?
      @linda.io.once "connect", @connect
    else
      @connect()
    return mm @, (key, args)=>
      @methodmissing key, args

  connect: =>
    @next()
    @watchCancel()

  next: ->
    if @tasks.length > 0 and !@isProcessing
      @task = @tasks.shift()
      @humanExec @task.key, @task.args

  exec: (key, arg, func)->
    args = [arg, func]
    @_do key, args
    # args.cid = @callbackId()
    # @tasks.push {key, args}
    # if !@isProcessing
    #   @next()
    # return args.cid

  _do: (key, args)->
    args.cid = @callbackId()
    @tasks.push {key, args}
    if !@isProcessing
      @next()
    return args.cid

  methodmissing: (key, args)->
    return sys.inspect @ if key is "inspect"
    args.callback = args[args.length - 1]
    @_do key, args
    # if @tasks.length is 0 and !@isProcessing and @linda.io.socket.connecting
    #   @humanExec key, args
    # else
    #   @tasks.push {key, args}
    # if @linda.io.socket.connecting?
    #   if @tasks.length > 0
    #     @tasks.push {key, args}
    #   else
    #     @humanExec(key, args)
    # else
    #   @tasks.push {key, args}

  humanExec: (key, args)->
    @isProcessing = true
    cid = args.cid
    tuple = @createTupleWithOption key, cid, args[0]
    if typeof args[args.length - 1] is "function"
      callback = args[args.length - 1]
    else
      callback = ->
    @once "#{cid}_callback", callback
    id = @sts.write tuple
    r = null
    if tuple.type is "broadcast"
      h = []
      for i in [0..tuple.count]
        h.push (callback)=>
          @addResult(cid, callback)
      async.parallel h, (err, results)=>
        throw err if err
        # @cancel cid
        @emit "#{cid}_callback", results
        @isProcessing = false
        @next()
    else
      @waitReturn cid, (tuple)=>
        r = tuple
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()
    return cid

  createTupleWithOption: (key, cid, option)->
    if !option?
      option =
        type: "eval"
        format: "boolean"
    tuple =
      baba: "script"
      name: @id
      type: option.type || "eval"
      key: key
      cid: cid || option.cid
      format: option.format || @defaultFormat
    return tuple if typeof option is "function"
    for k, v of option
      switch k
        when "broadcast"
          tuple.count = v - 1
          tuple.type = "broadcast"
        when "unicast"
          tuple.type = "unicast"
          tuple.unicast = v
        when "timeout"
          timeFormat = "YYYY-MM-DD HH:mm:ss"
          timeout = moment().add("seconds", v).format(timeFormat)
          tuple.timeout = timeout
          setTimeout =>
            @cancel cid
          , v
        else
          tuple[k] = v
    return tuple

  cancel: (cid)=>
    @sts.write {baba: "script", type: "cancel", cid: cid}
    # if @task.args.cid is cid
    #   console.log "yes!!"
    #   @task = null
    #   @isProcessing = false
    #   @next()
    #   return
    # for i in [0..@tasks.length-1]
    #   @tasks.splice i, 1 if @tasks[i].args.cid is cid

  watchCancel: ->
    @sts.watch {baba: "script", type: "cancel"}, (err, tuple)=>
      throw err if err
      cid = tuple.data.cid
      if @task.args.cid is cid
        @task.args.callback {value: "cancel"}
        @task = null
        @isProcessing = false
        @next()
        return
      return if @tasks.length is 0
      for i in [0..@tasks.length-1]
        if @tasks[i].args.cid is cid
          @tasks[i].args.callback {value: "cancel"}
          @tasks.splice i, 1

  waitReturn: (cid, callback)->
    @sts.take {baba: "script", type: "return", cid: cid}, (err, tuple)=>
      return callback.call @, {value: "cancel"} if err is "cancel"
      worker = @createWorker tuple.data.worker
      result =
        value:  tuple.data.value
        task:   tuple.data._task
        worker: worker
      callback.call @, result

  addResult: (cid, callback)=>
    @waitReturn cid, (r)=>
      callback null, r

  createWorker: (worker)->
    return new Script worker
    # if @id isnt worker
    #   return new Script worker
    # else
    #   return

    # return mm @, (key, args)=>
    #   if typeof args[0] is 'function'
    #     args[1] = args[0]
    #     args[0] = {}
    #   args[0].unicast = worker
    #   console.log "hoge"
    #   @methodmissing key, args

  callbackId: ->
    return "#{moment().unix()}_#{Math.random(1000000)}"
