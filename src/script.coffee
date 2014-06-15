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
    if _.isArray id
      @options.users = id
      @id = id.join ":"
    else
      # 同じグループで、同時に2つのプログラムが走った時
      # id_#{uuid}にして、同じ処理系統にならないようにする
      # id部分だけ抜き出して、グループ名にすればおｋ
      if id is ''
        id = @callbackId()
      @options.users = [id]
      @id = id
    @api = @options?.manager || 'http://linda.babascript.org'
    socket = SocketIOClient.connect @api, {'force new connection': true}
    @linda ?= new LindaSocketIOClient().connect socket
    @attributes = new UserAttributeWrapper()
    @sts = @linda.tuplespace @id
    @notification = @linda.tuplespace "notification"
    @membersData = []
    @membernames = []
    @tasks = []
    @broadcastTasks = []
    @events = new UserEvents()
    EventEmitter.call @events
    @linda.io.once "connect", @connect
    return @

  connect: =>
    {host, port} = @linda.io.socket.options
    @vclients = []
    @workers = []
    origin = "#{host}:#{port}"
    if @options.child is true
      return setImmediate =>
        @next()
        @watchCancel()
    _options = _.clone @options
    _options.child = true
    if !@options?.manager?
      if @options?.users?
        for user in @options.users
          return if user is @id
          u = {username: user}
          @vclients.push @createMediator u
      setImmediate =>
        @next()
        @watchCancel()
        @events.emit "ready go"
    else
      request.get("#{origin}/api/group/#{@id}/member").end (err, res) =>
        if res?.statusCode is 200
          members = []
          for user in res.body
            members.push user
          if !_.isArray members
            members = [members]
          for member in res.body
            {username, attribute} = member
            u =
              username: username
              attribute: attribute
            userAttribute = new UserAttribute @linda
            userAttribute.__syncStart u
            @membersData.push userAttribute
            @attributes.add userAttribute
            @vclients.push @createMediator member
            @membernames.push username
          setImmediate =>
            @next()
            @watchCancel()
            @events.emit "ready go"
            request.post("#{host}:#{port}/api/notification")
            .send({users: @membernames}).end (err, res) ->

        else
          # ここで、ユーザデータを取得する？
          names = if _options.users? then _options.users else @id
          request.get("#{origin}/api/users").send({names: names})
          .end (err, res) =>
            if res?.statusCode is 200
              for u in res.body
                userAttribute = new UserAttribute @linda
                d =
                  username: u.username
                  attribute: u.attribute
                userAttribute.__syncStart d
                @vclients.push @createMediator d
                @membersData.push userAttribute
                @attributes.add userAttribute
                @membernames.push u.username
            setImmediate =>
              @next()
              @watchCancel()
              @events.emit "ready go"
              request.post("#{host}:#{port}/api/notification")
              .send({users: @membernames}).end (err, res) ->
  next: ->
    # 人数次第で、適当に分けるようにできないか
    if @tasks.length > 0#and !@isProcessing
      @task = @tasks.shift()
      @humanExec @task.key, @task.args

  exec: (key, arg, func)->
    args = [arg, func]
    @_do key, args
    return args

  _do: (key, args)->
    args.cid = @callbackId()
    @tasks.push {key, args}
    # if !@isProcessing
    # 接続済みか、確認して@next
    @next()
    return args.cid

  addMember: (name) =>
    for u in @vclients
      if u.data.username is name
        return
    {host, port} = @linda.io.socket.options
    origin = "#{host}:#{port}"
    request.get("#{origin}/api/user/#{name}").end (err, res) =>
      if res.statusCode is 200
        user = res.body
        console.log '-------'
        console.log user
        console.log '-------'
        @vclients.push @createMediator user
        userAttribute = new UserAttribute @linda
        d =
          username: user.username
          attribute: user.attribute
        userAttribute.__syncStart d
        @membersData.push userAttribute
        @attributes.add userAttribute
        @membernames.push user.username
        request.post("#{host}:#{port}/api/notification")
        .send({users: user.username}).end (err, res) ->
      else
        @vclients.push @createMediator {username: name}
        console.log @vclients

  removeMember: (name) =>
    for v, i in @vclients
      if v.mediator.name is name
        v.linda.io.socket.disconnect()
        @vclients.splice i, 1
    @attributes.remove name
    for v, i in @membernames
      if v is name
        @membernames.splice i, 1

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
    # @sts.write tuple
    r = null
    cancelId = ""
    if tuple.type is "broadcast"
      h = []
      for i in [0..tuple.count]
        h.push (c)=>
          @addResult(cid, c)
      async.parallel h, (err, results)=>
        throw err if err
        cid = results[0].task.cid
        @sts.take {type: 'broadcast', cid: cid}, =>
          @cancel cid
          @emit "#{cid}_callback", results
          @broadcastTasks = []
          @next()
        @isProcessing = false
        @task = null
    else
      cancelid = @sts.take {type:'cancel', cid: cid}, (err, tuple)=>
        @emit "#{cid}_callback", tuple
        @isProcessing = true
        @next()
      cancelId = @waitReturn cid, (tuple)=>
        @sts.cancel cancelid
        @emit "#{cid}_callback", tuple
        @isProcessing = false
        @next()
    tuple.cancelId = cancelId
    @sts.write tuple
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
          timeFormat = "YYYY-MM-DD HH:mm:ss"
          timeout = moment().add("seconds", v).format(timeFormat)
          tuple.timeout = timeout
          setTimeout =>
            @cancel cid, @broadcastTasks
            @sts.cancel @cancelId # TODO インスタンス変数やめろ
            @cancelId = ''
          , v
        else
          tuple[k] = v
    return tuple

  cancel: (cid, value={error: 'cancel'})=>
    @sts.write {baba: "script", type: "cancel", cid: cid, value: value}

  watchCancel: ->
    @sts.watch {baba: "script", type: "cancel"}, (err, tuple)=>
      throw err if err
      cid = tuple.data.cid
      v = tuple.data.value
      if v? and _.isArray v
        for vv in v
          return if !vv.__worker
          a = (id) =>
            return @getWorker id
          vv.getWorker = _.bind a, {}, vv.__worker
      if tuple.data.value?
        result = v
      else
        result = {value: v}
      if @task?.args?.cid is cid
        @task.args.callback result
        @task = null
        @isProcessing = false
        @next()
        return
      return if @tasks.length is 0
      for i in [0..@tasks.length-1]
        if @tasks[i].args.cid is cid
          @tasks[i].args.callback result
          @tasks.splice i, 1

  waitReturn: (cid, callback)->
    return @sts.take {baba: "script", type: "return", cid: cid}, (err, tuple)=>
      return callback.call @, {value: "cancel"} if err is "cancel"
      if tuple.value?.error?
        console.log 'this is throw error message'
      options = @options
      worker = tuple.data.worker
      result =
        value:  tuple.data.value
        task:   tuple.data._task
        __worker: tuple.data.worker
        getWorker: ->
          options.child = true
          if tuple.data.worker is @id
            return @__self
          else
            return new BabaScript tuple.data.worker, options || {}
      callback.call @, result

  addResult: (cid, callback)=>
    @waitReturn cid, (r)=>
      @broadcastTasks.push r
      callback null, r

  getWorker: (id)=>
    options = @options
    options.child = true
    if id is @id
      return @__self
    else
      return new BabaScript id, options || {}

  callbackId: ->
    return "#{moment().unix()}_#{Math.random(1000000)}"

  createMediator: (member) ->
    # ここで、クライアントのフィルタリングしても良い
    c = new Client @id, @options || {}
    c.data = member
    c.mediator = c.linda.tuplespace member.username
    c.watchCancel = ->
      @group.watch {baba: "script", type: "cancel"}, (err, tuple) =>
        @mediator.write tuple.data
    c.on "get_task", (result)->
      result.taked = 'virtual'
      if result.type is 'broadcast'
        result.type = 'eval'
        result.oldtype = 'broadcast'
      if @options?.hubot? and !@hubot?
        type = @options.hubot
        @hubot = @mediator.linda.tuplespace('waiting_hubot')
        @hubot.write
          baba: "script"
          type: "connect"
          id: @mediator.name
        if type is 'mail'
          result.to = @data.attribute?.mail || "s09704tb@gmail.com"
          console.log result
      report = {baba: 'script', type: 'report', value: 'taked', tuple: result}
      @mediator.write report
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
        @returnValue r.data.value, {worker: @mediator.name}
        if @hubot?
          @hubot.write {baba: 'script', type: 'disconnect', id: @mediator.name}
          @hubot = null
    c.on "cancel_task", (result)->
      console.log 'mediator cancel'
      console.log result
      @mediator.write result
    return c

class UserEvents extends EventEmitter

class UserAttributeWrapper extends EventEmitter
  data: []
  add: (attribute) ->
    return if !attribute?
    @data.push attribute

  get: (name) ->
    for d in @data
      return d if d.name is name
    return null

  remove: (name) ->
    for d, i in @data
      @data.split i, 1 if d.name is name
    return null

class UserAttribute extends EventEmitter
  data: {}
  isSyncable: false
  constructor: (@linda) ->
    super()

  get: (key) ->
    return if !key?
    return @data[key]

  __syncStart: (_data) ->
    return if !_data?
    @name = _data.username
    __data = null
    for key, value of _data.attribute
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
        v = @get key
        if v isnt value
          @set key, value, {sync: false}
          @emit "change_data", @data
    if __data?
      for key, value of __data
        @sync key, value
      __data = null

  sync: (key, value) =>
    @ts.write {type: 'update', key: key, value: value}

  set: (key, value, options={sync: false}) ->
    return if !key? or !value?
    if options?.sync is true and @isSyncable is true
      if @get(key) isnt value
        @sync key, value
    else
      @data[key] = value

module.exports = class BabaScript extends BabaScriptBase

  constructor: (id, options) ->
    super id, options
    @__self = mm @, (key, args) =>
      @methodmissing key, args
    return @__self
