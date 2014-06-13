process.env.NODE_ENV = "test"

path = require "path"
assert = require "assert"
Babascript = require path.resolve "./lib/script"
Client = require "babascript-client"
_    = require "lodash"
address = 'http://localhost:9080'

describe "client test", ->

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
    client.on "get_task", (result)->
      @returnValue true
    client.on "cancel_task", (task)->
      console.log task
    baba.引数最後二つはコールバック関数でも良い {format: "boolean"}, (result)->
      done()

  it "baba should implement callback event", (done)->
    space = "baba_add_event"
    baba = new Babascript space, {manager: address}
    client = new Client space, {manager: address}
    client.on "get_task", (task)->
      @returnValue true
    client.on "cancel_task", (task)->
      console.log "cancel_task"
    baba.くらいあんとにこーるばっくいべんと {format: "boolean"}, (result)->
      assert.equal result.value, true
      done()

  it "return value should be boolean", (done)->
    space = "baba_boolean"
    baba = new Babascript space, {manager: address}
    client = new Client space, {manager: address}
    client.on "get_task", ->
      @returnValue true
    client.on "cancel_task", ->
      console.log cancel
    baba.ぶーりあんをください {format: "boolean"}, (result)->
      assert.equal result.value, true
      assert.equal typeof result.value, typeof true
      done()

  it "should multiple task", (done)->
    space = "baba_multiple_task"
    baba = new Babascript space, {manager: address}
    client = new Client space, {manager: address}
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
    baba = new Babascript space, {manager: address}
    count = 0
    ids = []
    clients = []
    for i in [0..9]
      client = new Client space, {manager: address}
      client.on "get_task", (result)->
        ids.push @id
        @returnValue true
      clients.push client
    setTimeout ->
      baba.しーくえんしゃる {format: "boolean"}, (result)->
        # console.log result.worker()
        count += 1
        if count is 10
          if _.uniq(ids).length is 10
            done()
        else
          baba.しーくえんしゃる {format: "boolean"}, arguments.callee
    , 1000

  it "return value should be string", (done)->
    space = "baba_string"
    name = "baba"
    baba = new Babascript space, {manager: address}
    client = new Client space, {manager: address}
    client.on "get_task", ->
      @returnValue name
    baba.すとりんぐをください {format: "string"}, (result)->
      assert.equal result.value, name
      assert.equal typeof result.value, typeof name
      done()

  it "return value should be number", (done)->
    space = "baba_number"
    number = 10
    baba = new Babascript space, {manager: address}
    client = new Client space, {manager: address}
    client.on "get_task", ->
      @returnValue number
    baba.なんばーをください {format: "number"}, (result)->
      assert.equal result.value, number
      assert.equal typeof result.value, typeof number
      done()

  it "broadcast task", (done)->
    space = "baba_broadcast"
    num = 10
    clients = []
    baba = new Babascript space, {manager: address}
    for i in [0..num-1]
      c = new Client space, {manager: address}
      c.on "get_task", (result)->
        @returnValue true
      clients.push c
    setTimeout =>
      baba.ぶろーどきゃすと {format: "boolean", broadcast: num}, (result)->
        assert.equal num, result.length
        done()
    , 3000

  it "single result.worker", (done)->

    space = "baba_result_worker"
    baba = new Babascript space, {manager: address}
    client = new Client space, {manager: address}
    client.on "get_task", ->
      @returnValue true

    baba.りざるとどっとわーかー {format: "boolean"}, (result)->
      assert.notEqual result.getWorker, null
      result.getWorker().つづき {format: "boolean"}, (result)->
        console.log result
        assert.notEqual result.getWorker, null
        done()

  it "multi result.worker", (done)->
    space = "baba_multi_result_worker"
    num = 3
    clients = []
    baba = new Babascript space, {manager: address}
    for i in [0..num-1]
      c = new Client space, {manager: address}
      c.on "get_task", (tuple) ->
        @returnValue true
      clients.push c
    setTimeout =>
      baba.まるちなりざるとどっとわーかー {format: "boolean", broadcast: num}, (result)->
        r = _.sample result
        id = r.getWorker().id
        r.getWorker().てすと {format: "boolean"}, (result) ->
          assert.ok result.value
          _id = result.getWorker().id
          assert.equal _id, id
          done()
    , 1000

  it "multi player", (done)->
    space_baba = "multi_player_baba"
    space_yamada = "multi_player_yamada"

    baba = new Babascript space_baba, {manager: address}
    yamada = new Babascript space_yamada, {manager: address}

    clientBaba = new Client space_baba, {manager: address}
    clientBaba.on "get_task", ->
      @returnValue "baba"

    clientaYamada = new Client space_yamada, {manager: address}
    clientaYamada.on "get_task", ->
      @returnValue "yamada"

    baba.ばばさん {format: "string"},(result)=>
      assert.equal result.value, "baba"
      yamada.やまだくん (result)=>
        assert.equal result.value, "yamada"
        done()

  it 'multi player in one variable', (done) ->
    space_baba = "multi_player_v_baba"
    space_yamada = "multi_player_v_yamada"

    babayamada = new Babascript [space_baba, space_yamada]

    clientBaba = new Client space_baba
    clientBaba.on "get_task", ->
      @returnValue false

    clientaYamada = new Client space_yamada
    clientaYamada.on "get_task", ->
      @returnValue true

    babayamada.multi_player_in_one_variable {format: 'boolean'}, (result) ->
      id = result.getWorker().id
      nextReturnerId = null
      nextReturne = null
      if id is space_baba
        assert.ok !result.value
        nextReturnerId = space_yamada
        nextReturn = true
      else if id is space_yamada
        assert.ok result.value
        nextReturnerId = space_baba
        nextReturn = false
      else
        assert.fail()
      babayamada.multi_player_in_one_variable2 {format: 'boolean'}, (result) ->
        assert.equal result.getWorker().id, nextReturnerId
        assert.equal result.value, nextReturn
        done()

  it 'add member', (done) ->
    space_baba = "add_member_baba"
    space_yamada = "add_member_yamada"

    clientBaba = new Client space_baba
    clientBaba.on "get_task", ->
      console.log "baba"
      @returnValue 1

    clientYamada = new Client space_yamada
    clientYamada.on "get_task", ->
      console.log "yamada"
      @returnValue 2

    members = new Babascript space_baba

    members.add_member_test {}, (result) ->
      id = result.getWorker().id
      v = result.value
      assert.equal id, space_baba
      assert.equal v, 1
      members.addMember space_yamada
      members.add_member_broadcast {broadcast: 2}, (results) ->
        assert.equal results.length, 2
        console.log results
        id1 = result[0].getWorker().id
        v1 = result[0].value
        if id1 is space_baba
          assert.equal v, 1
          nextValue = 2
          nextId = space_yamada
        else if id1 is space_yamada
          assert.equal v, 2
          nextValue = 1
          nextId = space_baba
        else
          assert.fail()
        id2 = result[1].getWorker().id
        v2 = result[1].value
        assert.equal nextId, id2
        assert.equal nextValue, v2
        done()

  it 'team test', (done) ->
    done()
  # it "virtual client test", (done) ->
  #
  #   baba = new Babascript "takumibaba", {linda: address, localUsers: ["takumibaba"]}
  #
  #   baba.進捗どうですか {format: "boolean"}, (result) ->
  #     console.log result
  #     done()
