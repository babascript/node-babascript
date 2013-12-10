mm = require "methodmissing"
{EventEmitter} = require "events"
crypto = require "crypto"
# LindaClient = require "node-linda-client"
LindaClient = require "../../linda-client/lib/client"
Linda = LindaClient.Linda
TupleSpace = LindaClient.TupleSpace
moment = require "moment"
sys = require "sys"
LindaBase = null
_ = require "underscore"

class Person extends EventEmitter
  cid: ""

  constructor: (@id)->
    LindaBase ?= new Linda "http://linda.masuilab.org"
    @ts = new TupleSpace @id, LindaBase
    @tasks = []
    @resultList = {}
    @count = {}
    if !LindaBase.io.connecting
      LindaBase.io.once "connect", @connect
    return mm @, (key, args)=>
      @methodmissing key, args

  connect: =>
    for task in @tasks
      @humanExec task.key, task.args

  methodmissing: (key, args)->
    console.log key, args
    return sys.inspect @ if key is "inspect"
    console.log LindaBase.isConnecting()
    if LindaBase.isConnecting()
      @humanExec(key, args)
    else
      @tasks.push {key, args}

  humanExec: (key, args)->
    if typeof args[args.length - 1] isnt "function"
      throw new Error "last args should be callback function"
    cid = callbackId()
    options = {}
    order = "eval"
    @resultList[cid] = []
    count = 0
    for k, v of args[0]
      switch k
        when "broadcast"
          count = v - 1
          order = "broadcast"
        when "unicast"
          order = "unicast"
          console.log "broadcast"
        when "format"
          options["format"] = v
        when "timeout"
          timeFormat = "YYYY-MM-DD HH:mm:ss"
          options["timeout"] = moment().add("seconds", v).format(timeFormat)
    callback = args[1]
    options["cid"] = cid
    tuple = ["babascript", order, key, options, {callback: cid}]
    console.log tuple
    console.log @ts
    @ts.write tuple
    @count[cid] = count
    @once "#{cid}_callback", callback
    @on "#{cid}_recall", =>
      @ts.take ["babascript", "return", cid], @returnTake
    @emit "#{cid}_recall"

  returnTake: (tuple, info)=>
    console.log tuple
    cid = tuple[2]
    @resultList[cid].push {value: tuple[3], person: @}
    if @count[cid] > 0
      @count[cid]
      @emit "#{cid}_recall"
      # @ts.take ["babascript", "return", cid], arguments.callee
    else
      @ts.write ["babascript", "cancel", cid]
      result = []
      for r in @resultList[cid]
        result.push r
      if result.length is 1
        result = result[0]
      @emit "#{cid}_callback", {result, info}
      # callback result, info

  callbackId = ->
    diff = moment().diff(LindaBase.time)
    params = "#{diff}#{moment().unix()}_#{Math.random(1000000)}"
    return crypto.createHash("md5").update(params, "utf-8").digest("hex")

class Persons extends Person

  constructor: (@name)->
    self = super @name
    @members = []
    return self

  connect: =>
    super()
    @ts.write ["babascript", "alivecheck"]
    @ts.watch ["babascript", "alive"], (tuple, info)=>
      flag = false
      for member in @members
        if member.id.toString() is tuple[2].toString()
          flag = true
      if !flag
        person = new Person tuple[2]
        @members.push person

  returnTake: (tuple, info)=>
    console.log tuple
    cid = tuple[2]
    worker = _.find @members, (member)=>
      return member.id().toString() is tuple[4].worker.toString()
    @resultList[cid].push {value: tuple[3], worker: worker}
    if @count[cid] > 0
      @count[cid]--
      @emit "#{cid}_recall"
    else
      @ts.write ["babascript", "cancel", cid]
      result = []
      for r in @resultList[cid]
        result.push r
      if result.length is 1
        result = result[0]
      @emit "#{cid}_callback", result, info

# class Baba

#   resultList: {}
#   connecting: false
#   base: ""
#   space: ""
#   @linda = null
#   ts: null

#   constructor: (space)->
#     people = new People "baba"
#     @base = "http://linda.masuilab.org"
#     @space = space || "baba"
#     @tasks = []
#     @ids = []
#     Baba.linda ?= new Linda @base
#     @ts = new TupleSpace @space, Baba.linda
#     Baba.linda.io.once "connect", =>
#       console.log "connect"
#       @connecting = true
#       for task in @tasks
#         @humanExec task.key, task.args
#       @ts.watch ["babascript", "alive"], (tuple, info)=>
#         @aliveCheck tuple[2]
#     Baba.linda.io.once "disconnect", =>
#       @connecting = false
#     baba = mm @, (key, args)=>
#       @__noSuchMethod key, args
#     return baba

#   __noSuchMethod: (key, args)=>
#     return sys.inspect @ if key is "inspect"
#     if @connecting
#       @humanExec(key, args)
#     else
#       @tasks.push {key, args}

#   humanExec: (key, args)=>
#     if typeof args[args.length-1] isnt 'function'
#       throw Error("last args should be callback function")
#     cid = @callbackId()
#     options = {}
#     order = "eval"
#     @resultList[cid] = []
#     count = 0
#     hash =
#       type: "babascript"
#       order: order
#       key: key
#       options: options
#       callback: cid
#     for arg in args
#       if arg["timeout"]
#         seconds = arg["timeout"]
#         timeFormat = "YYYY-MM-DD HH:mm:ss"
#         arg["timeout"] = moment().add("seconds", seconds).format(timeFormat)
#       if arg["count"]
#         count = arg["count"] - 1
#       if arg["broadcast"]
#         order = "broadcast"
#         count = arg["broadcast"] - 1
#       if arg["unicast"]
#         order = arg["unicast"]
#       if typeof arg is 'function'
#         callback = arg
#       else
#         for k, value of arg
#           options[k] = value
#     options["cid"] = cid
#     tuple = ["babascript", order, key, options, {"callback": cid}]
#     @ts.write tuple
#     timeoutFlag = false
#     if tuple[3].timeout?
#       timeoutFlag = true
#       t = Math.ceil(-(moment().diff tuple[3].timeout)/1000)
#       setTimeout =>
#         if timeoutFlag
#           @ts.write ["babascript", "cancel", cid]
#           @ts.take tuple, =>
#             callback {error: "timeout"}
#       , t*1000
#     @ts.take ["babascript", "return", cid], (_tuple, info, list)=>
#       timeoutFlag = false
#       if count > 0
#         count--
#         @resultList[cid].push _tuple
#         @ts.take ["babascript", "return", cid], arguments.callee
#       else
#         @resultList[cid].push _tuple
#         @ts.write ["babascript", "cancel", cid]
#         result = []
#         for r in @resultList[cid]
#           result.push r[3]
#         if result.length == 1
#           temp = result[0]
#           result = temp
#         callback result, info

#   callbackId: ->
#     diff = moment().diff(Baba.linda.time)
#     params = "#{diff}#{moment().unix()}_#{Math.random(1000000)}"
#     return crypto.createHash("md5").update(params, "utf-8").digest("hex")

#   workDone: =>
#     process.exit()
#     # @linda.io.disconnect()

#   aliveCheck: (userid)->
#     flag = false
#     for id in @ids
#       if id is userid
#         flag = true
#     if !flag
#       @ids.push userid

# class People
#   @linda: null

#   constructor: (name, linda)->
#     @ts = new TupleSpace name, LindaBase
#     @tasks = []
#     @members = []
#     @connecting = false
#     if !LindaBase?
#       LindaBase = new Linda()
#       LindaBase.io.on "connect", =>
#         for task in @tasks
#           @humanExec task.key, task.args
#         @ts.watch ["babascript", "alive"], (tuple, info)=>
#           console.log tuple
#           human = new Human tuple[2]
#           flag = false
#           for member in @members
#             if member.id is tuple[2]
#               flag = true
#           if !flag
#             @members.push human
#     return mm @, (key, args)=>
#       @methodmissing key, args

#   methodmissing: (key, args)=>
#     return sys.inspect @ if key is "inspect"
#     if @connecting
#       @humanExec(key, args)
#     else
#       @tasks.push {key, args}

#   humanExec: (key, args)=>
#     if typeof args[args.length-1] isnt 'function'
#       throw new Error("last args should be callback function")
#     cid = @callbackId()
#     options = {}
#     order = "eval"
#     @resultList[cid] = []
#     count = 0
#     hash =
#       type: "babascript"
#       order: order
#       key: key
#       options: options
#       callback: cid
#     options["cid"] = cid
#     tuple = ["babascript", order, key, options, {"callback": cid}]
#     @ts.write tuple
#     timeoutFlag = false
#     if tuple[3].timeout?
#       timeoutFlag = true
#       t = Math.ceil(-(moment().diff tuple[3].timeout)/1000)
#       setTimeout =>
#         if timeoutFlag
#           @ts.write ["babascript", "cancel", cid]
#           @ts.take tuple, =>
#             callback {error: "timeout"}
#       , t*1000
#     @ts.take ["babascript", "return", cid], (_tuple, info, list)=>
#       timeoutFlag = false
#       if count > 0
#         count--
#         @resultList[cid].push _tuple
#         @ts.take ["babascript", "return", cid], arguments.callee
#       else
#         @resultList[cid].push _tuple
#         @ts.write ["babascript", "cancel", cid]
#         result = []
#         for r in @resultList[cid]
#           result.push r[3]
#         if result.length == 1
#           temp = result[0]
#           result = temp
#         callback result, info

module.exports =
  # BabaScript: Baba
  Person: Person
  Persons: Persons
