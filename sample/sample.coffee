BabaScript = require "../babascript"

baba = new BabaScript()
baba.進捗どうですか {format: "bool"}, (result, info)->
  console.log result, info
  baba.exit()

console.log "hoge"