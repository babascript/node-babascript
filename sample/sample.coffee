Babascript = require "../lib/script"
EventEmitter = require('events').EventEmitter
_  = require 'underscore'
baba = new Babascript ['baba', 'yamada'], {manager: "http://localhost:9080"}
id = ""
baba.おはよう (result) ->

baba.こんにちわ (result) ->
  baba.addMember "tanaka"
  baba.いえーい {broadcast: 2}, (result) ->
    console.log result
baba.こんばんわ (result) ->
  id = result.getWorker().id
  baba.removeMember id
