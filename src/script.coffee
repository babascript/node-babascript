mm = require "methodmissing"
EventEmitter = require("EventEmitter2").EventEmitter2
LindaClient = require "../../linda-client/lib/client"
LindaSocketIOClient = require("linda-socket.io").Client
SocketIOClient = require "socket.io-client"
moment = require "moment"
sys = require "sys"
_ = require "underscore"
async = require "async"
Client = require "./client"
{Parse} = require "parse"

Linda = LindaClient.Linda
TupleSpace = LindaClient.TupleSpace
LindaBase = null

class Script extends EventEmitter
  cid: ""
  @socket: null
  @linda: null
  @vc: null

  constructor: (@id)->
    socket = SocketIOClient.connect("http://linda.babascript.org/")
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
    @_connect()
    # Parse.initialize APPID, JSKEY
    # query = new Parse.Query "masuilab"
    # query.find
    #   success: _.bind (list)=>
    #     @isInitialized = true
    #     arg =
    #       channels: ["masuilab"]
    #       data:
    #         action: "org.babascript.android.UPDATE_STATUS"
    #         msg: "ping"
    #     callback =
    #       success: ->
    #       error: ->
    #     Parse.Push.send arg, callback
    #     @_connect()
    #     @sts.write
    #       baba: "script"
    #       type: "aliveCheck"
    #     t =
    #       baba: "script"
    #       type: "alive"
    #       alive: true
    #     @sts.watch t, (tuple, info)=>
    #       v = _.filter @vms, (vm)=>
    #         return vm.id is tuple.id
    #       v = null
    #   error: (err)->
    #     @isInitialized = true
    #     @_connect()

        # Parse.Push.send {
        #   channels: ["masuilab"]
        #   data: {
        #     hoge: "Fuga"
        #   }
        # }, {
        #   success: ->
        #     console.log "success"
        #   error: ->
        #     console.log arguments
        # }
    # @ts.write
    #   baba: "script"
    #   type: "aliveCheck"
    # t =
    #   baba: "script"
    #   type: "alive"
    #   alive: true
    # @ts.watch t, (tuple, info)=>
      # flag = false
      # for member in @members.getAll
      #   if member.id().toString() is tuple.id.toString()
      #     flag = true
      # if !flag
      #   @members.add tuple.id
    # for task in @tasks
    #   @humanExec task.key, task.args

  _connect: ->
    if @tasks.length > 0
      for task in @tasks
        @humanExec task.key, task.args

  methodmissing: (key, args)->
    return sys.inspect @ if key is "inspect"
    if @linda.io.socket.connecting?
      @humanExec(key, args)
    else
      @tasks.push {key, args}

  humanExec: (key, args)->
    if typeof args[args.length - 1] isnt "function"
      throw new Error "last args should be callback function"
    cid = callbackId()
    tuple = @createTupleWithOption key, cid, args[0]
    callback = args[args.length - 1]
    @once "#{cid}_callback", callback
    @sts.write tuple
    if tuple.type is "broadcast"
      h = []
      for i in [0..tuple.count]
        h.push (callback)=>
          @addResult(cid, callback)
      async.parallel h, (err, results)=>
        throw err if err
        @cancel cid
        @emit "#{cid}_callback", results
    else
      @waitReturn cid, (tuple)=>
        @emit "#{cid}_callback", tuple

  createTupleWithOption: (key, cid, option)->
    tuple =
      baba: "script"
      type: option.type || "eval"
      key: key
      cid: cid || option.cid
      format: option.format || "boolean"
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
      result = {value: tuple.data.value, worker: worker}
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