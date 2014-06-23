mm = require 'methodmissing'
http = require 'http'
Util = require 'util'
request = require 'superagent'
EventEmitter = require("events").EventEmitter
LindaSocketIOClient = require("linda-socket.io").Client
SocketIOClient = require "socket.io-client"
Client = require "babascript-client"
moment = require "moment"
sys = require "sys"
_ = require "lodash"
async = require "async"

class BabaScriptBase extends EventEmitter
  linda: null
  isProcessing: false
  defaultFormat: 'boolean'
  id: ''
  @create = (id, options={})->
    return new BabaScript id, options
  @getLinda = ->
    api = 'http://linda.babascript.org'
    socket = SocketIOClient.connect api, {'force new connection': true}
    return new LindaSocketIOClient().connect socket

  constructor: (id, @options={})->
    super()
    @api = @options?.manager || 'http://linda.babascript.org'
    socket = SocketIOClient.connect @api
    @linda ?= new LindaSocketIOClient().connect socket
    if _.isArray id
      @id = id.join "::"
      @sts = []
      for i in id
        @sts.push @linda.tuplespace i
    else
      @id = id
      @sts = [@linda.tuplespace(@id)]
    @tasks = []
    @f = {}
    @execTasks = []
    @broadcastTasks = {}
    @loadingModules = []
    @modules = {}
    @setFlag = true
    @event = Object.create({})
    @data = {}
    EventEmitter.call @event
    if @linda.io.socket.open is true
      @connect()
    else
      @linda.io.on "connect", =>
        @connect()
    return @

  connect: =>
    if Object.keys(@modules).length > 0
      for name, module of @modules
        if module.body.connect?
          module.body.connect()
    @next()

  next: ->
    if @tasks.length > 0 and @linda.io.socket.open and @setFlag
      task = @tasks.shift()
      @execTasks.push task
      @humanExec task.key, task.args

  exec: (key, args, func) =>
    args.callback = func
    @_do key, args

  methodmissing: (key, args) =>
    if key is "inspect"
      return sys.inspect {}, { showHidden: true, depth: 2}
    args.callback = args[args.length - 1]
    @_do key, args

  _do: (key, args) ->
    args.cid = @callbackId()
    @tasks.push {key, args}
    @next()

  humanExec: (key, args) ->
    @isProcessing = true
    cid = @callbackId()
    tuple = @createTupleWithOption key, cid, args[0]
    if typeof args[args.length - 1] is "function"
      callback = args[args.length - 1]
    else if typeof args.callback is "function"
      callback = args.callback
    else
      callback = ->
    @once "#{cid}_callback", callback
    if tuple.type is "broadcast"
      h = []
      @f[cid] = []
      @broadcastTasks[cid] = []
      for i in [0..tuple.count]
        h.push (c) =>
          @f[cid].push c
        @addResult(cid)
      async.parallel h, (err, results)=>
        throw err if err
        cid = results[0].task.cid
        @f[cid] = null
        for ts in @sts
          ts.take {type: 'broadcast', cid: cid}, =>
            @cancel cid
            @broadcastTasks[cid] = null
        setImmediate =>
          if Object.keys(@modules).length > 0
            for name, module of @modules
              if module.body.receive?
                module.body.receive? results
          @emit "#{cid}_callback", results
          @next()
          @isProcessing = false
      setTimeout =>
        for ts in @sts
          ts.write tuple
      , 1000
    else
      ts = @sts.shift()
      ts.write tuple
      cancelid = ts.take {type:'cancel', cid: cid}, (err, tuple)=>
        return err if err
        if Object.keys(@modules).length > 0
          for name, module of @modules
            if module.body.receive?
              module.body.receive tuple
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()
      @waitReturn ts, cid, (tuple) =>
        ts.cancel cancelid
        if Object.keys(@modules).length > 0
          for name, module of @modules
            if module.body.receive?
              module.body.receive tuple
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()
      @sts.push ts
    if Object.keys(@modules).length > 0
      for name, module of @modules
        if module.body.send?
          module.body.send tuple
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
      at: Date.now()
    return tuple if typeof option is "function"
    for k, v of option
      switch k
        when "broadcast"
          if v is 'all'
            tuple.count = @getMembers.length - 1
          else
            tuple.count = v - 1
          tuple.type = "broadcast"
        when "unicast"
          tuple.type = "unicast"
          tuple.unicast = v
        when "timeout"
          setTimeout =>
            @cancel cid, @broadcastTasks[cid]
            for ts in @sts
              ts.cancel @cancelId # TODO インスタンス変数やめろ
            @cancelId = ''
            @emit "#{cid}_callback", @broadcastTasks[cid]
          , v
        else
          tuple[k] = v
    return tuple

  cancel: (cid, value={error: 'cancel'}) =>
    for ts in @sts
      ts.write {baba: "script", type: "cancel", cid: cid, value: value}

  watchCancel: ->
    for ts in @sts
      ts.watch {baba: "script", type: "cancel"}, (err, tuple)=>
        throw err if err
        cid = tuple.data.cid
        value = tuple.data.value
        if value?
          result = value
        else
          result = {value: value}
        @emit "#{cid}_callback", result

  waitReturn: (ts, cid, callback)->
    ts.take {baba: "script", type: "return", cid: cid}, (err, tuple) =>
      return callback.call @, {value: "cancel"} if err is "cancel"
      worker = tuple.data.worker
      result =
        value:  tuple.data.value
        task:   tuple.data._task
        __worker: worker
        getWorker: ->
          if worker is @id
            return @__self
          else
            return new BabaScript worker, {}
      callback.call @, result

  addResult: (cid)=>
    for ts in @sts
      @waitReturn ts, cid, (r) =>
        @broadcastTasks[cid].push r
        callback = @f[cid].shift()
        callback null, r

  callbackId: ->
    return "#{moment().unix()}_#{Math.random(1000000)}"

  getMembers: =>
    names = []
    for ts in @sts
      names.push ts.name
    return names

  addMember: (name) =>
    @sts.push @linda.tuplespace(name)

  removeMember: (name) =>
    for ts, i in @sts
      if ts.name is name
        @sts.splice i, 1

  set: (name, mod) =>
    @loadingModules.push {name: name, body: mod}
    @__set()

  __set: =>
    if @loadingModules.length is 0
      @next()
    else
      if @setFlag
        @setFlag = false
        mod = @loadingModules.shift()
        name = mod.name
        mod.body.load @, =>
          setTimeout =>
            @modules[name] = mod
            @setFlag = true
            @__set()
          , 100

module.exports = class BabaScript extends BabaScriptBase

  constructor: (id, options) ->
    super id, options
    @__self = mm @, (key, args) =>
      @methodmissing key, args
    return @__self
