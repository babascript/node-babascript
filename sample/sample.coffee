Babascript = require "../lib/script"
baba = new Babascript 'masuilab', {linda: "http://localhost:3030"}
baba.こんばんわ {format: "boolean"}, (result)->
  console.log 'end'
  console.log result
 # baba.おはよう {format: "boolean"}, (result)->
 #  console.log result
