Babascript = require "../lib/script"
EventEmitter = require('events').EventEmitter
_  = require 'underscore'
baba = new Babascript ['baba', 'yamada'], {manager: "http://localhost:9080"}
# baba = new Babascript 'masuilab', {manager: "http://localhost:9080"}
# baba = new Babascript 'baba', {manager: "http://localhost:9080"}
# baba.attributes.on "change_data", (userdata)->
  # console.log "change_data"
  # console.log userdata

id = ""
baba.おはよう (result) ->
  # console.log baba.membersData[0].get 'latitude'
  # console.log baba.membersData[0].data
  # console.log baba.addMember "tanaka"
baba.こんにちわ (result) ->
  baba.addMember "tanaka"
  baba.いえーい {broadcast: 2}, (result) ->
    console.log result
    # process.exit()
  # result.getWorker().ほわいとぼーど (result) ->
  #   baba.はい (result) ->
  #     console.log result
baba.こんばんわ (result) ->
  # console.log baba.id
  # id = result.getWorker().id
  # baba.removeMember id

  console.log 'konba'
# baba.exec "hoge", {format: 'boolean'}, (result) ->
#   result.getWorker().exec "fuga", {}, (r) ->
#     console.log r

# baba.on 'change_data', (attr) ->
#   console.log @
#   console.log attr
# baba.こんばんわ {format: "boolean"}, (result)->
#   console.log result
#   if !_.isArray(result) then a = result else a = result[0]
#   a.worker.ほげふが {format: 'string'}, (r) ->
#     console.log 'true end'
#     console.log r.value
#     console.log r.worker
#     r.worker.おはよう (rr) ->
#       console.log 'true true end'
#       console.log rr.value
#       console.log rr.worker
# console.log baba
  # EventEmitter.call baba
  # console.log baba
# baba.on "hoge", ->
#   console.log fuga
# baba.emit 'hoge'
# baba.attributes
# baba.on "change_data", (attr) ->
#   console.log "change data"
#   console.log attr
 # baba.おはよう {format: "boolean"}, (result)->
 #  console.log result
