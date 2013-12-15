{BabaScript} = require "../lib/babascript"
baba = new BabaScript("baba")

baba.進捗どうですか {format: "string"}, (result)->
  console.log result
  baba.workDone()
