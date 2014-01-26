mm = require "methodmissing"
# {EventEmitter} = require "events"
EventEmitter = require("EventEmitter2").EventEmitter2
crypto = require "crypto"
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

  constructor: (@id)->
    socket = SocketIOClient.connect("http://node-linda-base.herokuapp.com/")
    @linda ?= new LindaSocketIOClient().connect socket
    @sts = @linda.tuplespace @id
    @tasks = []
    if @linda.io.socket.connecting?
      @linda.io.on "connect", @connect()
    else
      @connect()
    return mm @, (key, args)=>
      @methodmissing key, args

  connect: =>
    @_connect()
    # APPID = "pyvshzjKW4PjrGsnyzFigtWk9AQYtSO1FpQ1U2jX"
    # JSKEY = "snbc64DVUJOSgQ3hs91hqwAaKgTfBjkSRFg8suOG"
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
      cid: option.cid || cid
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
      console.log tuple
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
    params = "#{moment().unix()}_#{Math.random(1000000)}"
    return crypto.createHash("md5").update(params, "utf-8").digest("hex")


# class Person extends EventEmitter

#   constructor: (@id, @script)->
#     return mm @, (key, args)=>
#       args.unicast = @id
#       script.humanExec key, args

# class Person extends EventEmitter
#   cid: ""

#   constructor: (@id)->
#     LindaBase ?= new Linda "http://localhost:5000"
#     @ts = new TupleSpace @id, LindaBase
#     @tasks = []
#     @resultList = {}
#     @count = {}
#     if !LindaBase.io.connecting
#       LindaBase.io.once "connect", @connect
#     return mm @, (key, args)=>
#       @methodmissing key, args

#   connect: =>
#     for task in @tasks
#       @humanExec task.key, task.args

#   methodmissing: (key, args)->
#     return sys.inspect @ if key is "inspect"
#     if LindaBase.isConnecting()
#       @humanExec(key, args)
#     else
#       @tasks.push {key, args}

#   humanExec: (key, args)->
#     if typeof args[args.length - 1] isnt "function"
#       throw new Error "last args should be callback function"
#     cid = callbackId()
#     @resultList[cid] = []
#     count = 0
#     tuple =
#       baba: "script"
#       type: "eval"
#       key: key
#       cid: cid
#       format: "boolean"
#     for k, v of args[0]
#       switch k
#         when "broadcast"
#           count = v - 1
#           tuple.type = "broadcast"
#         when "unicast"
#           if @members?
#             worker = _.find @members, (m)=>
#               return m.id().toString() is v
#             if worker?
#               tuple.type = "unicast"
#               tuple.unicast = worker.id()
#               # worker.humanExec key, args
#               return
#         when "format"
#           tuple.format = v
#         when "timeout"
#           timeFormat = "YYYY-MM-DD HH:mm:ss"
#           timeout = moment().add("seconds", v).format(timeFormat)
#           format.timeout = timeout
#         else
#           tuple[k] = v
#     callback = args[args.length - 1]
#     @once "#{cid}_callback", callback
#     @ts.write tuple
#     if tuple.type is "broadcast"
#       h = []
#       for i in [0..count]
#         h.push (callback)=>
#           @addResult(cid, callback)
#       async.parallel h, (err, results)=>
#         throw err if err
#         @cancel cid
#         @emit "#{cid}_callback", results
#     else
#       @waitReturn cid, (tuple, info)=>
#         @emit "#{cid}_callback", tuple, info

#   cancel: (cid)->
#     @ts.write {baba: "script", type: "cancel", cid: cid}

#   waitReturn: (cid, callback)->
#     @ts.take {baba: "script", type: "return", cid: cid}, (tuple, info)=>
#       if !@members
#         result = {value: tuple.value, worker: tuple.worker}
#       else
#         worker = @members.getOrAdd tuple.worker
#         result = {value: tuple.value, worker: worker}
#       callback.call @, result, info

#   addResult: (cid, callback)=>
#     @waitReturn cid, (r)=>
#       worker = @members.getOrAdd r.worker.id()
#       callback null, {value: r.value, worker: worker}
    
#   callbackId = ->
#     diff = moment().diff(LindaBase.time)
#     params = "#{diff}#{moment().unix()}_#{Math.random(1000000)}"
#     return crypto.createHash("md5").update(params, "utf-8").digest("hex")

class Members

  constructor: ->
    @members = []

  add: (id)->
    member = new Person id
    @members.push member

  get: (id)->
    return _.find @members, (member)=>
      return member.id() is id

  getOrAdd: (id)->
    worker = _.find @members, (member)=>
      return member.id() is id
    if !worker
      member = new Person id
      @members.push member
    return @get id

  getAll: ->
    return @members

  length: ->
    return @members.length

# class Persons extends Person

#   constructor: (@name)->
#     self = super @name
#     @members = new Members()
#     return self

#   connect: =>
#     super()
#     @ts.write
#       baba: "script"
#       type: "aliveCheck"
#     t =
#       baba: "script"
#       alive: true
#     @ts.watch t, (tuple, info)=>
#       flag = false
#       for member in @members.getAll
#         if member.id().toString() is tuple.id.toString()
#           flag = true
#       if !flag
#         @members.add tuple.id

  # returnTake: (tuple, info)=>
  #   console.log "Persons::returnTake"
  #   cid = tuple.cid
  #   worker = _.find @members, (member)=>
  #     return member.id().toString() is tuple.worker.toString()
  #   @resultList[cid].push {value: tuple.value, worker: worker}
  #   if @count[cid] > 0
  #     @count[cid]--
  #     @emit "#{cid}_recall"
  #   else
  #     @ts.write
  #       baba: "script"
  #       type: "cancel"
  #       cid: cid
  #     result = []
  #     for r in @resultList[cid]
  #       result.push r
  #     if result.length is 1
  #       result = result[0]
  #     @emit "#{cid}_callback", result, info


module.exports = Script
  # Persons: Persons
  # Person: Person
  # Members: Members
