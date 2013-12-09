mm = require "methodmissing"
crypto = require "crypto"
LindaClient = require "node-linda-client"
Linda = LindaClient.Linda
TupleSpace = LindaClient.TupleSpace
moment = require "moment"
sys = require "sys"

class Human

class People

class Baba

  resultList: {}
  connecting: false
  base: ""
  space: ""
  @linda = null
  ts: null

  constructor: (space)->
    @base = "http://linda.masuilab.org"
    @space = space || "baba"
    @tasks = []
    @ids = []
    Baba.linda ?= new Linda @base
    @ts = new TupleSpace @space, Baba.linda
    Baba.linda.io.once "connect", =>
      console.log "connect"
      @connecting = true
      for task in @tasks
        @humanExec task.key, task.args
      @ts.watch ["babascript", "alive"], (tuple, info)=>
        @aliveCheck tuple[2]
    Baba.linda.io.once "disconnect", =>
      @connecting = false
    baba = mm @, (key, args)=>
      @__noSuchMethod key, args
    return baba

  __noSuchMethod: (key, args)=>
    return sys.inspect @ if key is "inspect"
    if @connecting
      @humanExec(key, args)
    else
      @tasks.push {key, args}


  humanExec: (key, args)=>
    if typeof args[args.length-1] isnt 'function'
      throw Error("last args should be callback function")
    cid = @callbackId()
    options = {}
    order = "eval"
    @resultList[cid] = []
    count = 0
    hash =
      type: "babascript"
      order: order
      key: key
      options: options
      callback: cid
    for arg in args
      if arg["timeout"]
        seconds = arg["timeout"]
        timeFormat = "YYYY-MM-DD HH:mm:ss"
        arg["timeout"] = moment().add("seconds", seconds).format(timeFormat)
      if arg["count"]
        count = arg["count"] - 1
      if arg["broadcast"]
        order = "broadcast"
        count = arg["broadcast"] - 1
      if arg["unicast"]
        order = arg["unicast"]
      if typeof arg is 'function'
        callback = arg
      else
        for k, value of arg
          options[k] = value
    options["cid"] = cid
    tuple = ["babascript", order, key, options, {"callback": cid}]
    @ts.write tuple
    timeoutFlag = false
    if tuple[3].timeout?
      timeoutFlag = true
      t = Math.ceil(-(moment().diff tuple[3].timeout)/1000)
      setTimeout =>
        if timeoutFlag
          @ts.write ["babascript", "cancel", cid]
          @ts.take tuple, =>
            callback {error: "timeout"}
      , t*1000
    @ts.take ["babascript", "return", cid], (_tuple, info, list)=>
      timeoutFlag = false
      if count > 0
        count--
        @resultList[cid].push _tuple
        @ts.take ["babascript", "return", cid], arguments.callee
      else
        @resultList[cid].push _tuple
        @ts.write ["babascript", "cancel", cid]
        result = []
        for r in @resultList[cid]
          result.push r[3]
        if result.length == 1
          temp = result[0]
          result = temp
        callback result, info

  callbackId: ->
    diff = moment().diff(Baba.linda.time)
    params = "#{diff}#{moment().unix()}_#{Math.random(1000000)}"
    return crypto.createHash("md5").update(params, "utf-8").digest("hex")

  workDone: =>
    process.exit()
    # @linda.io.disconnect()

  aliveCheck: (userid)->
    flag = false
    for id in @ids
      if id is userid
        flag = true
    if !flag
      @ids.push userid


module.exports = Baba
