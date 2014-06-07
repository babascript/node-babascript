Babascript = require "../lib/script"
_  = require 'underscore'
# baba = new Babascript ['baba', 'tanaka'], {manager: "http://localhost:3030"}
baba = new Babascript 'masuilab', {manager: "http://localhost:3030"}
baba.こんばんわ {format: "boolean", broadcast: 2}, (result)->
  if !_.isArray(result) then a = result else a = result[0]
  a.worker.ほげふが {format: 'string'}, (r) ->
    console.log 'true end'
    console.log r.value
    console.log r.worker
    r.worker.おはよう (rr) ->
      console.log 'true true end'
      console.log rr.value
      console.log rr.worker
 # baba.おはよう {format: "boolean"}, (result)->
 #  console.log result
