BabaScript = require "../babascript"

baba = new BabaScript()

baba.進捗どうですか {format: "list", list: ["hoge", "fuga", "sore", "are", "foo", "bar"]}, (result)->
  console.log result
