process.env.NODE_ENV = "test"

path = require "path"
assert = require "assert"
Babascript = require path.resolve "./lib/script"
Client = require "babascript-client"
_    = require "lodash"

describe "normal babascript test", ->

  before (done) ->
    app = require('http').createServer (req, res) ->
      _url = require('url').parse(decodeURI(req.url), true)
      if _url.pathname is '/'
        res.writeHead 200
        res.end 'linda test server'
    port = process.env.PORT or 13000
    app.listen port
    io = require('socket.io').listen app
    linda  = require('linda').Server.listen {io: io, server: app}
    Babascript.address = Client.address = "http://localhost"
    process.env.PORT = port
    done()

  it "valid initialize", (done)->
    baba = new Babascript "baba"
    assert.notEqual baba, null
    done()

  it "valid namespace", (done)->
    space = "baba_namespace"
    baba = new Babascript space
    assert.equal baba.id, space
    done()

  it "baba constructor's arguments[length-1,2] is function", (done)->
    space = "baba_constructor_event"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (task) ->
      assert.equal task.key, "引数最後二つはコールバック関数でも良い"
      assert.equal task.format, 'boolean'
      @returnValue true
    client.once "cancel_task", (task)->
    baba.引数最後二つはコールバック関数でも良い {format: "boolean"}, (result)->
      assert.equal result.value, true
      done()

  it 'use exec', (done) ->
    space = 'baba_exec'
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
      @returnValue true
    baba.exec "useExecFunc", {format: 'boolean'}, (result) ->
      assert.equal result.value, true
      done()

  it 'use promise', (done) ->
    space = "baba_promise"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
      @returnValue true
    baba.usePromiseFunction({format: 'boolean'}).then (result) ->
      assert.equal result.value, true
      done()
    .catch (err) ->
      assert.fail()

  it 'use promise error version', (done) ->
    space = "baba_promise_error"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
      @cancel 'error'
    baba.usePromiseFunctionError({format: 'boolean'}).then (result) ->
      assert.fail()
    .catch (err) ->
      assert.equal err.reason, 'error'
      done()

  it 'use exec and promise', (done) ->
    space = 'baba_exec_promise'
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
      @returnValue true
    baba.exec("useExecFunc", {format: 'boolean'}).then (result) ->
      assert.equal result.value, true
      done()
    .catch (err) ->
      assert.fail()

  it "baba implement callback event", (done)->
    space = "baba_add_event"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (task)->
      @returnValue false
    client.once "cancel_task", (task)->
    baba.くらいあんとにこーるばっくいべんと {format: "boolean"}, (result)->
      assert.equal result.value, false
      done()

  it "return value should be boolean", (done)->
    space = "baba_boolean"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
      @returnValue true
    client.once "cancel_task", ->
    baba.ぶーりあんをください {format: "boolean"}, (result)->
      assert.equal result.value, true
      assert.equal typeof result.value, typeof true
      done()

  it "cancel task - script side", (done) ->
    space = "baba_cancel_script"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
    client.once "cancel_task", ->
    cid = baba.ぶーりあんをください {format: "boolean"}, (result)->
      assert.ok !result.value?
      assert.equal result.reason, 'cancel'
      done()
    baba.cancel cid, 'cancel'

  it "cancel task - client side", (done) ->
    space = "baba_cancel_client"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", (result) ->
      @cancel 'cancel'
    client.once "cancel_task", ->
    baba.ぶーりあんをください {format: "boolean"}, (result)->
      assert.ok !result.value?
      assert.equal result.reason, 'cancel'
      done()

  it "timeout error", (done) ->
    space = "baba_timeout"
    baba = new Babascript space
    baba.check_timeout_error {timeout: 5000}, (result) ->
      assert.equal result.type, 'cancel'
      assert.equal result.reason, 'timeout'
      done()

  it "should multiple task", (done)->
    space = "baba_multiple_task"
    baba = new Babascript space
    client = new Client space
    i = 0
    client.on "get_task", (result)->
      @returnValue i
      i += 1
    baba.いっこめ {format: "int"}, (r)->
      assert.equal r.value , 0
      baba.にこめ {format: "int"}, (r)->
        assert.equal r.value , 1
        baba.さんこめ {format: "int"}, (r)->
          assert.equal r.value , 2
          baba.よんこめ {format: "int"}, (r)->
            assert.equal r.value , 3
            done()

  it "sequential return value", (done)->
    space = "user/baba/seq"
    baba = new Babascript space
    count = 0
    ids = []
    clients = []
    for i in [0..9]
      client = new Client space
      client.once "get_task", (result)->
        ids.push @clientId
        @returnValue true
      clients.push client
    setTimeout ->
      baba.しーくえんしゃる {format: "boolean"}, (result)->
        count += 1
        if count is 10
          if _.uniq(ids).length is 10
            done()
        else
          baba.しーくえんしゃる {format: "boolean"}, arguments.callee
    , 1000

  it "sequential return value if one client", (done) ->
    space = "user/baba/seq/oneclient"
    baba  = new Babascript space
    j = 0
    for i in [0..9]
      baba.test_sequential_for_one_client {description: i}, (result) ->
        assert.equal result.value, j
        j++
        done() if j is 9
    setTimeout ->
      client = new Client space
      client.on "get_task", (result) ->
        @returnValue result.options.description
    , 500

  it "return value should be string", (done)->
    space = "baba_string"
    name = "baba"
    baba = new Babascript space
    client = new Client space
    client.once "get_task", ->
      @returnValue name
    baba.すとりんぐをください {format: "string"}, (result)->
      assert.equal result.value, name
      assert.equal typeof result.value, typeof name
      done()

  it "return value should be number", (done)->
    space = "baba_number"
    number = 10
    baba = new Babascript space
    client = new Client space
    client.once "get_task", ->
      @returnValue number
    baba.なんばーをください {format: "number"}, (result)->
      assert.equal result.value, number
      assert.equal typeof result.value, typeof number
      done()

  it "broadcast task", (done)->
    space = "baba_broadcast"
    num = 10
    clients = []
    baba = new Babascript space
    for i in [0..num-1]
      c = new Client space
      c.once "get_task", (result)->
        @returnValue true
      clients.push c
    setTimeout =>
      baba.ぶろーどきゃすと {format: "boolean", broadcast: num}, (result)->
        assert.equal num, result.length
        done()
    , 1000

  # TODO 通す
  # it 'cancel broadcast task', (done) ->
  #   space = "baba_broadcast"
  #   num = 10
  #   clients = []
  #   baba = new Babascript space
  #   for i in [0..num-3]
  #     c = new Client space
  #     c.once "get_task", (result)->
  #       @returnValue true
  #   cid = baba.ぶろーどきゃすと {format: "boolean", broadcast: num}, (result)->
  #     assert.equal num, result.length
  #     done()
  #   setTimeout ->
  #     baba.cancel cid, 'broadcast cancel'
  #   , 2000

  it "single result.worker", (done)->

    space = "baba_result_worker"
    baba = new Babascript space
    client = new Client space
    client.on "get_task", ->
      @returnValue true

    baba.りざるとどっとわーかー {format: "boolean"}, (result)->
      assert.equal result.worker, space
      worker = new Babascript result.worker
      worker.つづき {format: "boolean"}, (result)->
        assert.equal result.worker, space
        done()

  it "multi result.worker", (done)->
    space = "baba_multi_result_worker"
    num = 3
    clients = []
    baba = new Babascript space
    for i in [0..num-1]
      c = new Client space
      c.on "get_task", (tuple) ->
        @returnValue true
      clients.push c
    setTimeout =>
      baba.まるちなりざるとどっとわーかー {format: "boolean", broadcast: num}, (result)->
        r = _.sample result
        id = r.worker
        worker = new Babascript id
        worker.てすと {format: "boolean"}, (result) ->
          assert.ok result.value
          _id = result.worker
          assert.equal _id, id
          done()
    , 1000

  it "multi player", (done)->
    space_baba = "multi_player_baba"
    space_yamada = "multi_player_yamada"

    baba = new Babascript space_baba
    yamada = new Babascript space_yamada

    clientBaba = new Client space_baba
    clientBaba.once "get_task", ->
      @returnValue "baba"

    clientaYamada = new Client space_yamada
    clientaYamada.once "get_task", ->
      @returnValue "yamada"

    baba.ばばさん {format: "string"},(result)=>
      assert.equal result.value, "baba"
      yamada.やまだくん (result)=>
        assert.equal result.value, "yamada"
        done()

  it "set module", (done) ->
    space_baba = "module_set_baba"
    baba = new Babascript space_baba
    i = 1
    baba.set "test_1",
      load: (b, next) ->
        assert.equal i, 1
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.set "test_2",
      load: (b, next) ->
        assert.equal i, 2
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.set "test_3",
      load: (b, next) ->
        assert.equal i, 3
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.set "test_4",
      load: (b, next) ->
        assert.equal i, 4
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.set "test_5",
      load: (b, next) ->
        assert.equal i, 5
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->

    client = new Client space_baba
    client.on "get_task", ->
      @returnValue true
    baba.モジュールテスト {}, (result) ->
      assert.equal i, 6
      done()
