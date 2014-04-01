process.env.NODE_ENV = "test"

path = require "path"
assert = require "assert"
Baba = require "../lib/main"
_    = require "underscore"

describe "client test", ->

  it "valid initialize", (done)->
    baba = new Baba.Script "baba"
    assert.notEqual baba, null
    done()

  it "valid namespace", (done)->
    space = "baba_namespace"
    baba = new Baba.Script space
    assert.equal baba.id(), space
    done()

  it "baba constructor's arguments[length-1,2] is function", (done)->
    space = "baba_constructor_event"
    baba = new Baba.Script space
    client = new Baba.Client space
    client.on "get_task", (result)->
      console.log @
      @returnValue true
    client.on "cancel_task", (task)->
      console.log "task"
    # baba.引数最後二つはコールバック関数でも良い {format: "boolean"}, (result)->
    #   done()

  it "baba should implement callback event", (done)->
    space = "baba_add_event"
    baba = new Baba.Script space
    client = new Baba.Client space
    client.on "get_task", (task)->
      @returnValue true
    client.on "cancel_task", (task)->
      console.log "cancel_task"
    baba.くらいあんとにこーるばっくいべんと {format: "boolean"}, (result)->
      assert.equal result.value, true
      done()

  it "create client", (done)->
    space = "baba_create_client"
    baba = new Baba.Script space
    client = Baba.createClient(space)
    .on "get_task", ->
      @returnValue true
    .on "cancel_task", ->
      done()
    baba.くりえーとくらいあんと (result)->
      done()

  it "return value should be boolean", (done)->
    space = "baba_boolean"
    baba = new Baba.Script space
    client = new Baba.Client space
    client.on "get_task", ->
      @returnValue true
    client.on "cancel_task", ->
      console.log cancel
    baba.ぶーりあんをください {format: "boolean"}, (result)->
      assert.equal result.value, true
      assert.equal typeof result.value, typeof true
      done()

  it "should multiple task", (done)->
    space = "baba_multiple"
    baba = new Baba.Script space
    client = new Baba.Client space
    client.on "get_task", (result)->
      @returnValue true
    baba.いっこめ {format: "boolean"}, (r)->
      assert.equal r.value , true
      baba.にこめ {format: "boolean"}, (r)->
        assert.equal r.value , true
        baba.さんこめ {format: "boolean"}, (r)->
          assert.equal r.value , true
          baba.よんこめ {format: "boolean"}, (r)->
            assert.equal r.value , true
            done()

  it "sequential return value", (done)->
    space = "user/baba/seq"
    baba = new Baba.Script space
    count = 0
    ids = []
    clients = []
    for i in [0..9]
      client = new Baba.Client space
      client.on "get_task", (result)->
        @returnValue true
      clients.push client
    baba.しーくえんしゃる {format: "boolean"}, (result)->
      isExist = _.find ids, (id)->
        return id.toString() is result.worker.id()
      assert.equal isExist, undefined
      ids.push result.worker
      count += 1
      if count > 10
        done()
      else
        baba.しーくえんしゃる {format: "boolean"}, arguments.callee 


  it "return value should be string", (done)->
    space = "baba_string"
    name = "baba"
    baba = new Baba.Script space
    hoge = new Baba.Client space
    hoge.on "get_task", ->
      @returnValue name
    baba.すとりんぐをください {format: "string"}, (result)->
      assert.equal result.value, name
      assert.equal typeof result.value, typeof name
      done()

  it "return value should be number", (done)->
    space = "baba_number"
    number = 10
    baba = new Baba.Script space
    client = new Baba.Client space
    client.on "get_task", ->
      @returnValue number
    baba.なんばーをください {format: "number"}, (result)->
      assert.equal result.value, number
      assert.equal typeof result.value, typeof number
      done()

  it "broadcast task", (done)->
    space = "baba_broadcast"
    num = 3
    clients = []
    baba = new Baba.Script space
    for i in [0..num-1]
      c = new Baba.Client space
      c.on "get_task", (result)->
        console.log "ぶろーどきゃすと get task"
        console.log @
        @returnValue true
      clients.push c
    setTimeout =>
      console.log "num is #{num}"
      baba.ぶろーどきゃすと {format: "boolean", broadcast: num}, (result)->
        console.log "ぶろーどきゃすと"
        console.log result
        assert.equal num, result.length
        done()
    , 3000
    
  it "single result.worker", (done)->

    space = "baba_result_worker"
    baba = new Baba.Script space
    client = new Baba.Client space
    client.on "get_task", (tuple)->
      @returnValue true
    baba.りざるとどっとわーかー {format: "boolean"}, (result)->
      assert.notEqual result.worker, null
      result.worker.つづき {format: "boolean"}, (result)->
        assert.notEqual result.worker, null
        done()

  it "multi result.worker", (done)->
    space = "baba_multi_result_worker"
    num = 3
    clients = []
    baba = new Baba.Script space
    for i in [0..num]
      clients.push (new Baba.Client space).on("get_task", ->
        @returnValue true
      )
        
    setTimeout =>
      baba.まるちなりざるとどっとわーかー {format: "boolean", broadcast: num}, (result)->
        r = _.sample result
        id = r.worker.id
        r.worker.てすと {format: "boolean"}
        r.worker.on "get_task", (result)->
          assert.equal result.worker.id, id
          done()
    , 1000

  # it "multi player", (done)->
    space_baba = "baba_multi_player_baba"
    space_yamada = "baba_multi_player_yamada"
    baba = new Baba.Script space_baba
    yamada = new Baba.Script space_yamada

    client_baba = Baba.createClient(space_baba).on "get_task", ->
      @returnValue "baba"
    client_yamada = Baba.createClient(space_yamada).on "get_task", ->
      @returnValue "yamada"

    baba.ばばさん (result)=>
      assert.equal result.value, "baba"
      yamada.やまだくん (result)=>
        assert.equal result.value, "yamada"
        done()
