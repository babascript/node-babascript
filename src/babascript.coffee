mm = require "methodmissing"
{EventEmitter} = require "events"
crypto = require "crypto"
LindaClient = require "../../linda-client/lib/client"
Linda = LindaClient.Linda
TupleSpace = LindaClient.TupleSpace
moment = require "moment"
sys = require "sys"
LindaBase = null
_ = require "underscore"

class Person extends EventEmitter
  cid: ""

  constructor: (@id, @base)->
    LindaBase ?= new Linda @base || "http://linda.masuilab.org"
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
    return sys.inspect @ if key is "inspect"
    if LindaBase.isConnecting()
      @humanExec(key, args)
    else
      @tasks.push {key, args}

  humanExec: (key, args)->
    if typeof args[args.length - 1] isnt "function"
      throw new Error "last args should be callback function"
    cid = callbackId()
    options = {"cid": cid}
    order = "eval"
    @resultList[cid] = []
    count = 0
    for k, v of args[0]
      switch k
        when "broadcast"
          count = v - 1
          order = "broadcast"
        when "unicast"
          if @members?
            worker = _.find @members, (m)=>
              return m.id().toString() is v
            if worker?
              worker.humanExec key, args
              return
        when "format"
          options["format"] = v
        when "timeout"
          timeFormat = "YYYY-MM-DD HH:mm:ss"
          options["timeout"] = moment().add("seconds", v).format(timeFormat)
        else
          options[k] = v
    if !options["format"]?
      options["format"] = "boolean"
    callback = args[args.length - 1]
    tuple = ["babascript", order, key, options, {callback: cid}]
    @ts.write tuple
    @count[cid] = count
    @once "#{cid}_callback", callback
    @on "#{cid}_recall", =>
      @ts.take ["babascript", "return", cid], @returnTake
    @emit "#{cid}_recall"

  _humanExec: (key, args)->
    if typeof arg[args.length - 1] isnt 'function'
      done = false
      while(!done)
        # ここで、何かしらの方法で @on "#{cid}" が実行されるまで
        # 待機する

  returnTake: (tuple, info)=>
    cid = tuple[2]
    @resultList[cid].push {value: tuple[3], worker: @}
    if @count[cid] > 0
      @count[cid]
      @emit "#{cid}_recall"
    else
      @ts.write ["babascript", "cancel", cid]
      result = []
      for r in @resultList[cid]
        result.push r
      if result.length is 1
        result = result[0]
      @emit "#{cid}_callback", result, info

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


module.exports =
  BabaScript: Persons
  Person: Person
  Persons: Persons
