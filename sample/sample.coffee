Babascript = require "../lib/script"
baba = new Babascript "baba", {linda: "http://localhost:3030"}
baba.こんばんわ {format: "camera"}, (result)->
  console.log result
