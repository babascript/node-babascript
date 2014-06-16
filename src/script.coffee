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
  @getLinda = (_api)->
    api = _api || 'http://linda.babascript.org'
    socket = SocketIOClient.connect api, {'force new connection': true}
    return new LindaSocketIOClient().connect socket

  constructor: (id, @options={})->
    @api = @options?.manager || 'http://linda.babascript.org'
    socket = SocketIOClient.connect @api, {'force new connection': true}
    @linda ?= new LindaSocketIOClient().connect socket
    if _.isArray id
      @id = id.join "::"
      @sts = []
      for i in id
        @sts.push @linda.tuplespace i
    else
      @id = id
      @sts = [@linda.tuplespace @id]
    @tasks = []
    @f = {}
    @execTasks = []
    @broadcastTasks = {}
    @linda.io.on "connect", @connect
    return @

  connect: =>
    @next()

  next: ->
    # 人数次第で、適当に分けるようにできないか
    if @tasks.length > 0
      task = @tasks.shift()
      @execTasks.push task
      @humanExec task.key, task.args

  exec: (key, args, func)->
    args.callback = func
    @_do key, args

  methodmissing: (key, args)->
    if key is "inspect"
      return sys.inspect {}, { showHidden: true, depth: 2}
    args.callback = args[args.length - 1]
    @_do key, args

  _do: (key, args)->
    args.cid = @callbackId()
    @tasks.push {key, args}
    @next()

  humanExec: (key, args)->
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
          @emit "#{cid}_callback", results
          @next()
          @isProcessing = false
      for ts in @sts
        ts.write tuple
    else
      ts = @sts.shift()
      ts.write tuple
      cancelid = ts.take {type:'cancel', cid: cid}, (err, tuple)=>
        return err if err
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()
      @waitReturn ts, cid, (tuple) =>
        ts.cancel cancelid
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()
      @sts.push ts
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
        # if _.isArray value
        #   for vv in v
        #     return if !vv.__worker
        #     a = (id) =>
        #       return @getWorker id
        #     vv.getWorker = _.bind a, {}, vv.__worker
        # else
        #
        if value?
          result = value
        else
          result = {value: v}
        @emit "#{cid}_callback", result

  waitReturn: (ts, cid, callback)->
    ts.take {baba: "script", type: "return", cid: cid}, (err, tuple) =>
      return callback.call @, {value: "cancel"} if err is "cancel"
      if tuple.value?.error?
        console.log 'error'
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

  addMember: (name) =>
    @sts.push @linda.tuplespace(name)

  removeMember: (name) =>
    for ts, i in @sts
      if ts.name is name
        @sts.splice i, 1

  # createMediator: (member) ->
  #   # ここで、クライアントのフィルタリングしても良い
  #   c = new Client @id, @options || {}
  #   c.data = member
  #   c.mediator = c.linda.tuplespace member.username
  #   c.watchCancel = ->
  #     @group.watch {baba: "script", type: "cancel"}, (err, tuple) =>
  #       @mediator.write tuple.data
  #   c.on "get_task", (result)->
  #     result.taked = 'virtual'
  #     if result.type is 'broadcast'
  #       result.type = 'eval'
  #       result.oldtype = 'broadcast'
  #     if @options?.hubot? and !@hubot?
  #       type = @options.hubot
  #       @hubot = @mediator.linda.tuplespace('waiting_hubot')
  #       @hubot.write
  #         baba: "script"
  #         type: "connect"
  #         id: @mediator.name
  #       if type is 'mail'
  #         result.to = @data.attribute?.mail || "s09704tb@gmail.com"
  #     report =
          # baba: 'script'
          # type: 'report'
          # value: 'taked'
          # tuple: result
  #     @mediator.write report
  #     @mediator.write result
      # ここで、Babascript Client に流すか
      # 外部サービスを利用した形にするか、決定する
      # 外部サービスならwebhook
      # url += c.name
      # result.username = c.name
      # result.groupname = c.id
      # result.service = c.api
      # result.key = result.key + "#{Date.now()}"
      # request.post(url).send(result).end (err, res)  ->
  #     @mediator.take {cid: result.cid, type: 'return'}, (err, r)=>
  #       @returnValue r.data.value, {worker: @mediator.name}
  #       if @hubot?
          # @hubot.write
            # baba: 'script'
            # type: 'disconnect'
            # id: @mediator.name
  #         @hubot = null
  #   c.on "cancel_task", (result)->
  #     @mediator.write result
  #   return c

module.exports = class BabaScript extends BabaScriptBase

  constructor: (id, options) ->
    super id, options
    @__self = mm @, (key, args) =>
      @methodmissing key, args
    return @__self



  # addMember: (name) =>
  #   for u in @vclients
  #     if u.data.username is name
  #       return
  #   {host, port} = @linda.io.socket.options
  #   origin = "#{host}:#{port}"
  #   request.get("#{origin}/api/user/#{name}").end (err, res) =>
  #     if res.statusCode is 200
  #       user = res.body



  #       @vclients.push @createMediator user
  #       userAttribute = new UserAttribute @linda
  #       d =
  #         username: user.username
  #         attribute: user.attribute
  #       userAttribute.__syncStart d
  #       @membersData.push userAttribute
  #       @attributes.add userAttribute
  #       @membernames.push user.username
  #       request.post("#{host}:#{port}/api/notification")
  #       .send({users: user.username}).end (err, res) ->
  #     else
  #       @vclients.push @createMediator {username: name}
  #       # console.log @vclients
  #
  # removeMember: (name) =>
  #   console.log "remove member"
  #   for v, i in @vclients
  #     if v? and v.mediator.name is name
  #       v.linda.io.socket.disconnect()
  #       @vclients.splice i, 1
  #   @attributes.remove name
  #   for v, i in @membernames
  #     if v? and v is name
  #       @membernames.splice i, 1


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
