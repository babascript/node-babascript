Babascript = require "../lib/script"
EventEmitter = require('events').EventEmitter
_  = require 'underscore'
baba = new Babascript ['baba','yamada'], {manager: "http://localhost:9080"}#, hubot: 'mail'}
id = ""
baba.おはよう (result) ->
  console.log result.value
baba.こんばんわ (result) ->
  console.log baba.attributes.data
  console.log result.value
  id = result.getWorker().id
  a = new Babascript "", {manager: "http://localhost:9080"}
  a.addMember "tanaka"
  a.てすと (result) ->
    console.log result
  baba.こんにちわ (result) ->
    console.log result.value

linda = Babascript.getLinda()
