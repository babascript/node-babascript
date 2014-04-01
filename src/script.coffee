mm = require "methodmissing"
EventEmitter = require("EventEmitter2").EventEmitter2
LindaSocketIOClient = require("linda-socket.io").Client
SocketIOClient = require "socket.io-client"
moment = require "moment"
sys = require "sys"
_ = require "underscore"
async = require "async"
Manager = require "./manager"

class Script extends EventEmitter
  linda: null
  isProcessing: false
  defaultFormat: "boolean"
  api: "http://127.0.0.1:3000"

  constructor: (_id)->
    socket = SocketIOClient.connect @api
    if _id instanceof Manager
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

  next: ->
    if @tasks.length > 0 and !@isProcessing
      task = @tasks.shift()
      @humanExec task.key, task.args

  methodmissing: (key, args)->
    return sys.inspect @ if key is "inspect"
    @tasks.push {key, args}
    if !@isProcessing
      @next()
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
    cid = callbackId()
    tuple = @createTupleWithOption key, cid, args[0]
    if typeof args[args.length - 1] is "function"
      callback = args[args.length - 1]
    else
      callback = ->
    @once "#{cid}_callback", callback
    @sts.write tuple
    r = null
    if tuple.type is "broadcast"
      h = []
      for i in [0..tuple.count]
        h.push (callback)=>
          @addResult(cid, callback)
      async.parallel h, (err, results)=>
        throw err if err
        @cancel cid
        @emit "#{cid}_callback", results
        @isProcessing = false
        @next()
    else
      @waitReturn cid, (tuple)=>
        r = tuple
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()

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
        else
          tuple[k] = v
    return tuple

  cancel: (cid)->
    @sts.write {baba: "script", type: "cancel", cid: cid}

  waitReturn: (cid, callback)->
    @sts.take {baba: "script", type: "return", cid: cid}, (err, tuple)=>
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
    return mm @, (key, args)=>
      if typeof args[0] is 'function'
        args[1] = args[0]
        args[0] = {}
      args[0].unicast = worker
      @methodmissing key, args
    
  callbackId = ->
    return "#{moment().unix()}_#{Math.random(1000000)}"

module.exports = Script