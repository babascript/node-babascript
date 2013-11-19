mm = require "methodmissing"
crypto = require "crypto"
Linda = require "node-linda-client"
moment = require "moment"
sys = require "sys"

class Baba

  resultList: {}

  constructor: (base, space)->
    @base = base || "http://linda.masuilab.org/"
    @space = space || "takumibaba"
    @linda = new Linda @base, @space
    baba = mm @, (key, args)=>
      @__noSuchMethod key, args
    return baba
  
  __noSuchMethod: (key, args)=>
    return sys.inspect @ if key is "inspect"
    @humanExec(key, args)
    
  humanExec: (key, args)=>
    throw Error("last args should be callback function") if typeof args[args.length-1] isnt 'function'
    @linda.io.once "connect", =>
      console.log "connect"
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
      console.log tuple
      @linda.ts.write tuple
      timeoutFlag = false
      if tuple[3].timeout?
        timeoutFlag = true
        t = Math.ceil(-(moment().diff tuple[3].timeout)/1000)
        setTimeout ()=>
          if timeoutFlag
            @linda.ts.write ["babascript", "cancel", cid]
            @linda.ts.take tuple, =>
              callback {error: "timeout"}
        , t*1000
      @linda.ts.take ["babascript", "return", cid], (_tuple, info, list)=>
        timeoutFlag = false
        if count > 0
          count--
          console.log "count: #{count}"
          @resultList[cid].push _tuple
          @linda.ts.take ["babascript", "return", cid], arguments.callee
        else
          console.log "callback!"
          @resultList[cid].push _tuple
          @linda.ts.write ["babascript", "cancel", cid]
          callback @resultList[cid], info

  callbackId: ->
    return crypto.createHash("md5").update("#{moment().diff(@linda.time)}#{moment().unix()}_#{Math.random(1000000)}", "utf-8").digest("hex")

  exit: =>
    @linda.io.close()


module.exports = Baba
