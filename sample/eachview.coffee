# {BabaScript} = require "../lib/babascript"
Baba = require "../lib/main"

baba = new Baba.Script "baba"

baba.進捗どうですか {format: "list", list:["進捗ダメです", "進捗普通です", "進捗良いです", "デモします", "ねむい"]}, (result)->
  baba.進捗どうですか {format: "string"}, (result)->
    baba.進捗どうですか {format: "number"}, (result)->
    baba.進捗どうですか {format: "boolean"}, (result)->
