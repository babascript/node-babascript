Baba = require "../../lib/main"
baba = new Baba.Script "baba"

lunch = ["和食", "洋食", "中華", "その他"]
baba.昼食何が良いですか {format: "list", list: lunch}, (result)->
  console.log "method name: #{result.task.key}"
  console.log "return value: #{result.value}"
  baba.昼飯の予約をしてください {format: "boolean"}, (result)->
    console.log "method name: #{result.task.key}"
    console.log "return value: #{result.value}"
    if result.value
      process.exit()
    else
      baba.昼飯の予約をしてください arguments.callee
