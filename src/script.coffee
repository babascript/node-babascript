mm = require 'methodmissing'
http = require 'http'
Util = require 'util'
request = require 'superagent'
# EventEmitter = require("events").EventEmitter
EventEmitter = require("EventEmitter2").EventEmitter2
LindaSocketIOClient = require("linda-socket.io").Client
SocketIOClient = require "socket.io-client"
Client = require "../../node-babascript-client/lib/client"
moment = require "moment"
sys = require "sys"
_ = require "lodash"
async = require "async"

module.exports = class BabaScript extends EventEmitter
  linda: null
  isProcessing: false
  defaultFormat: 'boolean'
  id: ''
  @create = (id, options={})->
    return new BabaScript id, options

  constructor: (id, @options={})->
    if _.isArray id
      @options.users = id
      @id = id.join ":"
    else
      # 同じグループで、同時に2つのプログラムが走った時
      # id_#{uuid}にして、同じ処理系統にならないようにする
      # id部分だけ抜き出して、グループ名にすればおｋ
      @id = id
    @api = @options?.manager || 'http://linda.babascript.org'
    socket = SocketIOClient.connect @api, {'force new connection': true}
    @linda ?= new LindaSocketIOClient().connect socket
    @attributes = new UserAttribute @linda
    @sts = @linda.tuplespace @id
    @membersData = []
    @tasks = []
    @linda.io.once "connect", @connect
    @__self = mm @, (key, args) =>
      @methodmissing key, args
    return @__self

  connect: =>
    {host, port} = @linda.io.socket.options
    @vclients = []
    @workers = []
    if @options.child is true
      return setImmediate =>
        @next()
        @watchCancel()
    _options = _.clone @options
    _options.child = true
    if !@options?.manager?
      @workers = []
      if !@options?.users?
        _options.users = [@id]
      for user in _options.users
        u = {username: user}
        @vclients.push @createMediator u
      setImmediate =>
        @next()
        @watchCancel()
    else
      request.get("#{host}:#{port}/api/group/#{@id}/member").end (err, res) =>
        if res?.statusCode is 200
          members = []
          for user in res.body
            members.push user
          if !_.isArray members
            members = [members]
          for member in members
            userAttribute = new UserAttribute @linda
            userAttribute.__syncStart member
            @membersData.push userAttribute
            # @membersData.push new UserAttribute @linda
            # @membersData[member.username] = new UserAttribute @linda
            # @membersData[member.username].__syncStart member
            @vclients.push @createMediator member
        else
          # ここで、ユーザデータを取得する？
          names = if _options.users? then _options.users else @id
          request.get("#{host}:#{port}/api/users").send({names: names})
          .end (err, res) =>
            if res?.statusCode is 200
              for u in res.body
                @vclients.push @createMediator u
                userAttribute = new UserAttribute @linda
                userAttribute.__syncStart u
                @membersData.push userAttribute
        setImmediate =>
          @next()
          @watchCancel()

  next: ->
    if @tasks.length > 0
      @task = @tasks.shift()
      @humanExec @task.key, @task.args

  exec: (key, arg, func)->
    args = [arg, func]
    @_do key, args

  _do: (key, args)->
    args.cid = @callbackId()
    @tasks.push {key, args}
    # if !@isProcessing
    # 接続済みか、確認して@next
    @next()
    return args.cid

  addMember: (name) ->
    {host, port} = @linda.io.socket.options
    request.get("#{host}:#{port}/api/user/#{name}").end (err, res) =>
      user = res.body
      @vclients.push @createMediator user
      userAttribute = new UserAttribute @linda
      userAttribute.__syncStart user
      @membersData.push userAttribute

  removeMember: (name) ->
    for v in @vclients
      if v.mediator.name is name
        v.linda.io.socket.disconnect()

  methodmissing: (key, args)->
    return sys.inspect @ if key is "inspect"
    args.callback = args[args.length - 1]
    @_do key, args
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

  humanExec: (key, args)->
    @isProcessing = true
    cid = args.cid
    tuple = @createTupleWithOption key, cid, args[0]
    if typeof args[args.length - 1] is "function"
      callback = args[args.length - 1]
    else
      callback = ->
    @once "#{cid}_callback", callback
    @sts.write tuple
    r = null
    if tuple.type is "broadcast"
      h = []
      for i in [0..tuple.count]
        h.push (c)=>
          @addResult(cid, c)
      async.parallel h, (err, results)=>
        throw err if err
        # @cancel cid
        @emit "#{cid}_callback", results
        @isProcessing = false
        cid = @task.args.cid
        tt =
          type: 'broadcast'
          cid: cid
        @sts.take tt, ->
        @task = ''
        @next()
    else
      @waitReturn cid, (tuple)=>
        @emit "#{cid}_callback", tuple
        @isProcessing = false
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
          setTimeout =>
            @cancel cid
            @sts.cancel @cancelId
            @cancelId = ''
          , v
        else
          tuple[k] = v
    return tuple

  cancel: (cid)=>
    @sts.write {baba: "script", type: "cancel", cid: cid}

  watchCancel: ->
    @sts.watch {baba: "script", type: "cancel"}, (err, tuple)=>
      throw err if err
      cid = tuple.data.cid
      if @task?.args?.cid is cid
        @task.args.callback {value: "cancel"}
        @task = null
        @isProcessing = false
        @next()
        return
      return if @tasks.length is 0
      for i in [0..@tasks.length-1]
        if @tasks[i].args.cid is cid
          @tasks[i].args.callback {value: "cancel"}
          @tasks.splice i, 1

  waitReturn: (cid, callback)->
    @sts.take {baba: "script", type: "return", cid: cid}, (err, tuple)=>
      return callback.call @, {value: "cancel"} if err is "cancel"
      options = @options
      result =
        value:  tuple.data.value
        task:   tuple.data._task
        getWorker: ->
          options.child = true
          return new BabaScript tuple.data.worker, options || {}
      callback.call @, result

  addResult: (cid, callback)=>
    @waitReturn cid, (r)=>
      callback null, r

  getWorker: (id)->
    options = @options
    options.child = true
    return new BabaScript id, options || {}

  callbackId: ->
    return "#{moment().unix()}_#{Math.random(1000000)}"

  createMediator: (member) ->
    # ここで、クライアントのフィルタリングしても良い
    # 追加/削除もイベント発行で、みたいな
    c = new Client @id, @options || {}
    c.data = member
    c.mediator = c.linda.tuplespace member.username
    c.mediator.watch {type: 'update', what: 'data'}, (err, r) =>
      key = r.tuple.key
      c.data[key] = r.tuple.value
    c.on "get_task", (result)->
      result.type = 'eval'
      # console.log 'get_task'
      # console.log result
      @mediator.write result
      # ここで、Babascript Client に流すか
      # 外部サービスを利用した形にするか、決定する
      # 外部サービスならwebhook
      # url += c.name
      # result.username = c.name
      # result.groupname = c.id
      # result.service = c.api
      # result.key = result.key + "#{Date.now()}"
      # request.post(url).send(result).end (err, res)  ->
      @mediator.take {cid: result.cid, type: 'return'}, (err, r)=>
        # console.log 'return value'
        # console.log r
        @returnValue r.data.value, {worker: @mediator.name}
    c.on "cancel_task", (result)->
      @mediator.write result
    return c

class UserAttribute extends EventEmitter
  data: {}
  isSyncable: false
  constructor: (@linda) ->
    super()

  get: (key) ->
    return if !key?
    return @data[key]

  __syncStart: (attr) ->
    return if !attr?
    @name = attr.username
    __data = null
    for key, value of attr
      if !@get(key)?
        @set key, value
      else
        __data = {} if !__data?
        __data[key] = value
    @isSyncable = true
    @emit "get_data", @data
    @ts = @linda.tuplespace(@name)
    @ts.watch {type: 'userdata'}, (err, result) =>
      return if err
      {key, value, username} = result.data
      if username is @name
        @set key, value
        @emit "change_data", @data
    if __data?
      for key, value of __data
        @sync key, value

  sync: (key, value) =>
    @ts.write {type: 'update', key: key, value: value}

  set: (key, value, options={sync: false}) ->
    return if !key? or !value?
    if options?.sync and @isSyncable is true
      @sync key, value
    else
      @data[key] = value
