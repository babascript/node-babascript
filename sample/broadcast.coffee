# {BabaScript} = require "../lib/babascript"
Baba = require "../lib/main"
babas  = new Baba.Script "baba", {linda: 'http://localhost:3030'}
_ = require "underscore"

lunch = ["和食", "洋食", "中華", "その他"]
babas.昼食何が良いですか {format: "list", list: lunch, broadcast: 10}, (results)->
  workers = []
  hoge = {}
  console.log results
  for result in results
    hoge[result.value] += 1
    worker = result.worker
    count = 0
  console.log hoge
  # winners = _.sample results # 多数決多かった人たち
  # winners.random().お店の予約をしてください {}, ()->
  #   worker.いえい {format: "bool"}, (result)->
  #     console.log "value is " + result.value
  #     count += 1
  #     if count is 1
  #       yamada.こんばんわ {format : "bool"}, (result)->
  #         process.exit()

# 飲み会の予約(幹事プログラム)
# 自分プログラム
# 自分が実行するデモ
# デモをするデモ
# プレゼンの一部をプログラム化する
