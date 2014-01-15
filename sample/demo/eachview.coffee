Baba = require "../../lib/main"

baba = new Baba.Script "masuilab"

list = ["進捗ダメです", "進捗普通です", "進捗良いです", "デモします", "ねむい"]
baba.進捗どうですか {format: "list", list: list}, (result)->
  baba.進捗どうですか {format: "string"}, (result)->
    baba.進捗どうですか {format: "number"}, (result)->
      baba.進捗どうですか {format: "boolean"}, (result)->
        process.exit()
