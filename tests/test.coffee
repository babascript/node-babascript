process.env.NODE_ENV = "test"

path = require "path"
assert = require "assert"
Babascript = require path.resolve "./lib/index"
Adapter = require 'babascript-linda-adapter'
Client = require "babascript-client"
_ = require 'lodash'


describe 'plugin test', ->

  it "set module", (done) ->
    space_baba = "module_set_baba"
    baba = new Babascript space_baba
    i = 1
    baba.plugins.set "test_1",
      load: (b, next) ->
        assert.equal i, 1
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.plugins.set "test_2",
      load: (b, next) ->
        assert.equal i, 2
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.plugins.set "test_3",
      load: (b, next) ->
        assert.equal i, 3
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.plugins.set "test_4",
      load: (b, next) ->
        assert.equal i, 4
        i += 1
        next()
      connect: ->
      send: ->
      receive: ->
    baba.plugins.set "test_5",
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
    baba.モジュールテスト {}, (err, result) ->
      assert.equal i, 6
      done()


describe "normal babascript test", ->

  scriptAdapter = null
  clientAdapter = null
  port = process.env.PORT or 13000

  before (done) ->
    app = require('http').createServer (req, res) ->
      _url = require('url').parse(decodeURI(req.url), true)
      if _url.pathname is '/'
        res.writeHead 200
        res.end 'linda test server'
    app.listen port, ->
      done()
    io = require('socket.io').listen app
    linda  = require('linda').Server.listen {io: io, server: app}
    Babascript.address = Client.address = 'http:'
    process.env.PORT = port

  # beforeEach (done) ->
  #   scriptAdapter = new Adapter 'http://localhost', {port: port}
  #   clientAdapter = new Adapter 'http://localhost', {port: port}
  #   scriptAdapter.linda.io.on 'connect', ->
  #     console.log 'connect'
  #     done()
  #
  # afterEach (done) ->
  #   console.log scriptAdapter
  #   scriptAdapter.linda.io.on 'disconnect', ->
  #     scriptAdapter = null
  #     done()
  #   clientAdapter.linda.io.on 'disconnect', ->
  #     clientAdapter = null
  #   scriptAdapter.disconnect()
  #   clientAdapter.disconnect()

  getAdapter = ->
    return new Adapter 'http://localhost', {port: port}


  it "valid initialize", (done)->
    baba = new Babascript "baba"
    assert.notEqual baba, null
    done()

  it "valid namespace", (done)->
    space = "baba_namespace"
    baba = new Babascript space, {adapter: getAdapter()}
    assert.equal baba.id, space
    done()

  it "baba constructor's arguments[length-1,2] is function", (done)->
    space = "baba_constructor_event"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      assert.equal task.key, "引数最後二つはコールバック関数でも良い"
      assert.equal task.format, 'boolean'
      @returnValue true
    client.once "cancel_task", (task)->
    baba.引数最後二つはコールバック関数でも良い {format: "boolean"}, (err, result)->
      assert.equal result.value, true
      done()

  it 'miss adapter', (done) ->
    space = 'baba_miss_adapter'
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      @returnValue true
    baba.miss_adapter {format: 'boolean'}, (err, result) ->
      assert.equal result.value, true
      done()

  it 'use exec', (done) ->
    space = 'baba_exec'
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      @returnValue true
    baba.exec "useExecFunc", {format: 'boolean'}, (err, result) ->
      assert.equal result.value, true
      done()

  it 'use promise', (done) ->
    space = "baba_promise"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      @returnValue true
    baba.usePromiseFunction({format: 'boolean'}).then (result) ->
      assert.equal result.value, true
      done()
    .catch (err) ->
      assert.fail()

  it 'use promise error version', (done) ->
    space = "baba_promise_error"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      @cancel 'error'
    baba.usePromiseFunctionError({format: 'boolean'}).then (err, result) ->
      assert.fail()
    .catch (err) ->
      assert.equal err.message, 'error'
      done()

  it 'use exec and promise', (done) ->
    space = 'baba_exec_promise'
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      @returnValue true
    baba.exec("useExecFunc", {format: 'boolean'}).then (result) ->
      assert.equal result.value, true
      done()
    .catch (err) ->
      assert.fail()

  it "baba implement callback event", (done)->
    space = "baba_add_event"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task)->
      @returnValue false
    client.once "cancel_task", (task)->
    baba.くらいあんとにこーるばっくいべんと {format: "boolean"}, (err, result) ->
      assert.equal result.value, false
      done()

  it "return value should be boolean", (done)->
    space = "baba_boolean"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
      @returnValue true
    client.once "cancel_task", ->
    baba.ぶーりあんをください {format: "boolean"}, (err, result) ->
      assert.equal result.value, true
      assert.equal typeof result.value, typeof true
      done()

  it "cancel task - script side", (done) ->
    space = "baba_cancel_script"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", (task) ->
    client.once "cancel_task", ->
    reason = 'script side cancel'
    cid = baba.ぶーりあんをください {format: "boolean"}, (err, result) ->
      assert.equal result, null
      assert.equal err.message, reason
      done()
    baba.cancel cid, reason

  it "cancel task - client side", (done) ->
    space = "baba_cancel_client"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    reason = 'client side cancel'
    client.once "get_task", (task) ->
      @cancel reason
    client.once "cancel_task", ->
    baba.ぶーりあんをください {format: "boolean"}, (err, result) ->
      assert.equal result, null
      assert.equal err.message, reason
      done()

  it "timeout error", (done) ->
    space = "baba_timeout"
    baba = new Babascript space, {adapter: getAdapter()}
    reason = 'timeout'
    baba.check_timeout_error {timeout: 5000}, (err, result) ->
      assert.equal err.message, reason
      done()

  it "should multiple task", (done)->
    space = "baba_multiple_task"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    i = 0
    client.on "get_task", (err, result) ->
      @returnValue i
      i += 1
    baba.いっこめ {format: "int"}, (err, result) ->
      assert.equal result.value , 0
      baba.にこめ {format: "int"}, (err, result) ->
        assert.equal result.value , 1
        baba.さんこめ {format: "int"}, (err, result) ->
          assert.equal result.value , 2
          baba.よんこめ {format: "int"}, (err, result) ->
            assert.equal result.value , 3
            done()

  it "sequential return value", (done)->
    space = "user/baba/seq"
    baba = new Babascript space, {adapter: getAdapter()}
    count = 0
    ids = []
    clients = []
    for i in [0..9]
      client = new Client space, {adapter: getAdapter()}
      client.once "get_task", (err, result) ->
        ids.push @clientId
        @returnValue true
      clients.push client
    setTimeout ->
      baba.しーくえんしゃる {format: "boolean"}, (err, result) ->
        count += 1
        if count is 10
          if _.uniq(ids).length is 10
            done()
        else
          baba.しーくえんしゃる {format: "boolean"}, arguments.callee
    , 1000

  it "sequential return value if one client", (done) ->
    space = "user/baba/seq/oneclient"
    baba  = new Babascript space, {adapter: getAdapter()}
    j = 0
    for i in [0..9]
      baba.test_sequential_for_one_client {description: i}, (err, result) ->
        assert.equal result.value, j
        j++
        done() if j is 9
    setTimeout ->
      client = new Client space, {adapter: getAdapter()}
      client.on "get_task", (task) ->
        @returnValue task.options.description
    , 500

  it "return value should be string", (done)->
    space = "baba_string"
    name = "baba"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", ->
      @returnValue name
    baba.すとりんぐをください {format: "string"}, (err, result) ->
      assert.equal result.value, name
      assert.equal typeof result.value, typeof name
      done()

  it "return value should be number", (done)->
    space = "baba_number"
    number = 10
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.once "get_task", ->
      @returnValue number
    baba.なんばーをください {format: "number"}, (err, result) ->
      assert.equal result.value, number
      assert.equal typeof result.value, typeof number
      done()

  it "broadcast task", (done)->
    space = "baba_broadcast"
    num = 10
    clients = []
    baba = new Babascript space, {adapter: getAdapter()}
    for i in [0..num-1]
      c = new Client space, {adapter: getAdapter()}
      c.once "get_task", (err, result) ->
        @returnValue true
      clients.push c
    setTimeout =>
      baba.ぶろーどきゃすと {format: "boolean", broadcast: num}, (err, result) ->
        assert.equal num, result.length
        done()
    , 1000

  # TODO 通す
  # it 'cancel broadcast task', (done) ->
  #   space = "baba_broadcast"
  #   num = 10
  #   clients = []
  #   baba = new Babascript space, {adapter: getAdapter()}
  #   for i in [0..num-3]
  #     c = new Client space, {adapter: getAdapter()}
  #     c.once "get_task", (err, result) ->
  #       @returnValue true
  #   cid = baba.ぶろーどきゃすと {format: "boolean", broadcast: num}, (err, result) ->
  #     assert.equal num, result.length
  #     done()
  #   setTimeout ->
  #     baba.cancel cid, 'broadcast cancel'
  #   , 2000

  it "single result.worker", (done)->

    space = "baba_result_worker"
    baba = new Babascript space, {adapter: getAdapter()}
    client = new Client space, {adapter: getAdapter()}
    client.on "get_task", ->
      @returnValue true

    baba.りざるとどっとわーかー {format: "boolean"}, (err, result) ->
      assert.equal result.worker, space
      worker = new Babascript result.worker, {adapter: getAdapter()}
      worker.つづき {format: "boolean"}, (err, result) ->
        assert.equal result.worker, space
        done()

  it "multi result.worker", (done)->
    space = "baba_multi_result_worker"
    num = 3
    clients = []
    baba = new Babascript space, {adapter: getAdapter()}
    for i in [0..num-1]
      c = new Client space, {adapter: getAdapter()}
      c.on "get_task", (tuple) ->
        @returnValue true
      clients.push c
    setTimeout =>
      baba.まるちなりざるとどっとわーかー {format: "boolean", broadcast: num}, (err, result) ->
        r = _.sample result
        id = r.worker
        worker = new Babascript id, {adapter: getAdapter()}
        worker.てすと {format: "boolean"}, (err, result) ->
          assert.ok result.value
          _id = result.worker
          assert.equal _id, id
          done()
    , 1000

  it "multi player", (done)->
    space_baba = "multi_player_baba"
    space_yamada = "multi_player_yamada"

    baba = new Babascript space_baba, {adapter: getAdapter()}
    yamada = new Babascript space_yamada, {adapter: getAdapter()}

    clientBaba = new Client space_baba, {adapter: getAdapter()}
    clientBaba.once "get_task", ->
      @returnValue "baba"

    clientaYamada = new Client space_yamada, {adapter: getAdapter()}
    clientaYamada.once "get_task", ->
      @returnValue "yamada"

    baba.ばばさん {format: "string"},(err, result) =>
      assert.equal result.value, "baba"
      yamada.やまだくん (er, result) =>
        assert.equal result.value, "yamada"
        done()
