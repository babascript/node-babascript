Babascript = require "../lib/script"
EventEmitter = require('events').EventEmitter
_  = require 'underscore'
# baba = new Babascript ['baba', 'tanaka'], {manager: "http://localhost:3030"}

# baba = new Babascript 'masuilab', {manager: "http://localhost:3030"}
baba = Babascript.create 'masuilab', {manager: "http://localhost:3030"}
baba.on 'change_data', (attr)->
  console.log attr
# baba.on "hoge", ->
#   console.log "hoge"
# baba.emit 'hoge'
# baba.こんばんわ {format: "boolean"}, (result)->
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
