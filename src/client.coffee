{EventEmitter} = require "events"
LindaClient = require "../../linda-client/lib/client"
TupleSpace = LindaClient.TupleSpace
Linda = LindaClient.Linda

class Client extends EventEmitter

  constructor: (name, callbackFunc, cancelFunc)->
    @linda = new Linda "http://localhost:5000"
    @tasks = []
    @id = @getId()
    @linda.io.once "connect", =>
      @group = new TupleSpace name, @linda
      @uni   = new TupleSpace @id, @linda
      @next()
      @broadcast()
      @unicast()
      @watchAliveCheck()
    @on "get_task", callbackFunc if typeof callbackFunc is "function"
    @on "cancel_task", cancelFunc if typeof cancelFunc is "function"

  next: ->
    if @tasks.length > 0
      task = @tasks[0]
      format = task.format
      @emit "get_task", tuple
    else
      @group.take {baba: "script", type: "eval"}, (tuple, info)=>
        @tasks.push tuple
        @emit "get_task", tuple if @tasks.length > 0

  unicast: ->
    @uni.watch {baba: "script", type: "eval"}, (tuple, info)=>
      tuple.unicast = true
      @tasks.push tuple
      @emit "get_task", tuple if @tasks.length > 0

  broadcast: ->
    t = {baba: "script", type: "broadcast"}
    @group.watch t, (tuple, info)=>
      @tasks.push tuple
      @emit "get_task", tuple if @tasks.length > 0

  watchCancel: (callback)->
    @group.watch {baba: "script", type: "cancel"}, (tuple, info)->
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
    ts = if task.unicast is true then @uni else @group
    tuple =
      baba: "script"
      type: "return"
      value: value
      cid: task.cid
      worker: @id
      options: options
    ts.write tuple
    @tasks.shift()
    @next()

  watchAliveCheck: ->
    @group.watch {baba: "script", type: "aliveCheck"}, (tuple, info)=>
      @group.write {baba: "script", alive: true, id: @id}

  getId: ->
    return "#{Math.random()*10000}_#{Math.random()*10000}"

module.exports = Client