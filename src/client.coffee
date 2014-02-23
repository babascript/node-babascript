EventEmitter = require("EventEmitter2").EventEmitter2
LindaSocketIOClient = require("linda-socket.io").Client
SocketIOClient = require "socket.io-client"

class Client extends EventEmitter

  constructor: (@name)->
    options =
      'force new connection': true
    socket = SocketIOClient.connect("http://linda.babascript.org/", options)
    @linda = new LindaSocketIOClient().connect socket
    @tasks = []
    @id = @getId()
    if socket.socket.connecting?
      @connect()
    else
      @linda.io.once "connect", @connect
    return @

  connect: ->
    @group = @linda.tuplespace @name
    @next()
    @broadcast()
    @unicast()
    @watchAliveCheck()

  next: ->
    if @tasks.length > 0
      task = @tasks[0]
      format = task.format
      @emit "get_task", task
    else
      @group.take {baba: "script", type: "eval"}, (err, tuple)=>
        return err if err
        @tasks.push tuple.data
        @emit "get_task", tuple.data if @tasks.length > 0

  unicast: ->
    t = {baba: "script", type: "unicast", unicast: @id}
    @group.watch t, (err, tuple)=>
      @tasks.push tuple
      @emit "get_task", tuple if @tasks.length > 0

  broadcast: ->
    t = {baba: "script", type: "broadcast"}
    # 一度、readしてデータを取得する？
    @group.watch t, (err, tuple)=>
      @tasks.push tuple
      @emit "get_task", tuple if @tasks.length > 0

  watchCancel: (callback)->
    @group.watch {baba: "script", type: "cancel"}, (err, tple)->
      console.log "cancel"
      cancelTasks = _.where @tasks, {cid: tuple.cid}
      if cancelTasks?
        for task in cancelTasks
          if task is @tasks[0]
            @emit "cancel_task", task
            @next()
          @tasks.remove task

  returnValue: (value, options={})->
    task = @tasks[0]
    tuple =
      baba: "script"
      type: "return"
      value: value
      cid: task.cid
      worker: @id
      options: options
    @group.write tuple
    @tasks.shift()
    @next()

  watchAliveCheck: ->
    @group.watch {baba: "script", type: "aliveCheck"}, (err, tuple)=>
      @group.write {baba: "script", alive: true, id: @id}

  getId: ->
    return "#{Math.random()*10000}_#{Math.random()*10000}"

module.exports = Client