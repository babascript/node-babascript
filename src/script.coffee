mm = require "methodmissing"
{EventEmitter} = require "events"
crypto = require "crypto"
LindaClient = require "../../linda-client/lib/client"
moment = require "moment"
sys = require "sys"
_ = require "underscore"
async = require "async"
Linda = LindaClient.Linda
TupleSpace = LindaClient.TupleSpace
LindaBase = null

class Person extends EventEmitter
  cid: ""

  constructor: (@id)->
    LindaBase ?= new Linda "http://localhost:5000"
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
    @resultList[cid] = []
    count = 0
    tuple =
      baba: "script"
      type: "eval"
      key: key
      cid: cid
      format: "boolean"
    for k, v of args[0]
      switch k
        when "broadcast"
          count = v - 1
          tuple.type = "broadcast"
        when "unicast"
          if @members?
            worker = _.find @members, (m)=>
              return m.id().toString() is v
            if worker?
              worker.humanExec key, args
              return
        when "format"
          tuple.format = v
        when "timeout"
          timeFormat = "YYYY-MM-DD HH:mm:ss"
          timeout = moment().add("seconds", v).format(timeFormat)
          format.timeout = timeout
        else
          tuple[k] = v
    callback = args[args.length - 1]
    @once "#{cid}_callback", callback
    @ts.write tuple
    if tuple.type is "broadcast"
      h = []
      for i in [0..count]
        h.push (callback)=>
          @addResult(cid, callback)
      async.parallel h, (err, results)=>
        throw err if err
        @cancel cid
        @emit "#{cid}_callback", results
    else
      @waitReturn cid, (tuple, info)=>
        @emit "#{cid}_callback", tuple, info

  cancel: (cid)->
    @ts.write {baba: "script", type: "cancel", cid: cid}

  waitReturn: (cid, callback)->
    @ts.take {baba: "script", type: "return", cid: cid}, (tuple, info)=>
      if !@members
        result = {value: tuple.value, worker: tuple.worker}
      else
        worker = @members.getOrAdd tuple.worker
        result = {value: tuple.value, worker: worker}
      callback.call @, result, info

  addResult: (cid, callback)=>
    @waitReturn cid, (r)=>
      worker = @members.getOrAdd r.worker.id()
      callback null, {value: r.value, worker: worker}
    
  callbackId = ->
    diff = moment().diff(LindaBase.time)
    params = "#{diff}#{moment().unix()}_#{Math.random(1000000)}"
    return crypto.createHash("md5").update(params, "utf-8").digest("hex")

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

class Persons extends Person

  constructor: (@name)->
    self = super @name
    @members = new Members()
    return self

  connect: =>
    super()
    @ts.write
      baba: "script"
      type: "aliveCheck"
    t =
      baba: "script"
      alive: true
    @ts.watch t, (tuple, info)=>
      flag = false
      for member in @members.getAll
        if member.id().toString() is tuple.id.toString()
          flag = true
      if !flag
        @members.add tuple.id

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


module.exports =
  Persons: Persons
  Person: Person
  Members: Members