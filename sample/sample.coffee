LindaClient = require "../../linda-client/lib/client"
_ = require "underscore"
Linda = LindaClient.Linda
TupleSpace = LindaClient.TupleSpace

Baba = require "../lib/main"

# client = new Baba.Client "baba", ()->
#   @returnValue "hogefuga"
baba = new Baba.Script.Persons "baba"
# baba.ほげふが {format: "boolean"}, ->
#   console.log "いえーい"
#   baba.あれそれ {format: "boolean"}, ->
#     console.log "いえーい"

console.log "hoge"
num = 90
clients = []
for i in [0..100]
  clients.push new Baba.Client "baba", ->
    @returnValue true
console.log "fuga"
baba.ほげふが {format: "boolean", broadcast: num}, (result)->
  console.log result.length




# {BabaScript} = require "../lib/script"
# baba = new BabaScript("baba")
# baba.進捗どうですか {format: "boolean"}, (result, info)->
#   if result is true
#     console.log "良い進捗ですね"
#   else
#     console.log "進捗ダメです"
#     baba.もう一度進捗はどうなんですか {format: "boolean"}, (result, info)->
#       console.log "そうですか"
#       baba.workDone()

