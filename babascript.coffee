mm = require "methodmissing"
crypto = require "crypto"
Linda = require "node-linda-client"
moment = require "moment"
sys = require "sys"

class Baba

  resultList: {}
  tasks: []
  connecting: false

  constructor: (space)->
    @base = "http://linda.masuilab.org"
    @space = space || "takumibaba"
    @linda = new Linda @base, @space
    @linda.io.on "connect", =>
      @connecting = true
      for task in @tasks
        @humanExec task.key, task.args
    @linda.io.on "disconnect", =>
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
    throw Error("last args should be callback function") if typeof args[args.length-1] isnt 'function'
    cid = @callbackId()
    options = {}
    order = "eval"
    @resultList[cid] = []
    count = 0
    for arg in args
      if arg["timeout"]
        arg["timeout"] = moment().add("seconds", arg["timeout"]).format("YYYY-MM-DD HH:mm:ss")
      if arg["count"]
        count = arg["count"] - 1
      if arg["broadcast"]
        order = "broadcast"
        count = arg["broadcast"] - 1
      if typeof arg is 'function'
        callback = arg
      else
        for k, value of arg
          options[k] = value
    tuple = ["babascript", order, key, options, {"callback": cid}]
    @linda.ts.write tuple
    timeoutFlag = false
    if tuple[3].timeout?
      timeoutFlag = true
      t = Math.ceil(-(moment().diff tuple[3].timeout)/1000)
      setTimeout ()=>
        if timeoutFlag
          console.log "timeout"
          @linda.ts.write ["babascript", "cancel", cid]
          @linda.ts.take tuple, =>
            callback {error: "timeout"}
      , t*1000
    @linda.ts.take ["babascript", "return", cid], (_tuple, info, list)=>
      timeoutFlag = false
      if count > 0
        count--
        @resultList[cid].push _tuple
        @linda.ts.take ["babascript", "return", cid], arguments.callee
      else
        @resultList[cid].push _tuple
        @linda.ts.write ["babascript", "cancel", cid]
        result = []
        for r in @resultList[cid]
          result.push r[3]
        if result.length == 1
          temp = result[0]
          result = temp
        callback result, info

  callbackId: ->
    return crypto.createHash("md5").update("#{moment().diff(@linda.time)}#{moment().unix()}_#{Math.random(1000000)}", "utf-8").digest("hex")

  workDone: =>
    process.exit()
    # @linda.io.disconnect()


module.exports = Baba
