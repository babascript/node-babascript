Baba = require "../../lib/main"

baba = new Baba.Script("takumibaba")

week = ["日", "月", "火", "水", "木", "金", "土"]
d = (new Date()).getDay()
if week[d] is "月"
  baba.ゴミの量はどれくらいか {format: "int"}, (result)-> # センサー代わり
    if result.value > 5
      baba.ゴミ出しをする()
    baba.洗濯物はどれくらい溜まっているか {format: "int"}, (result)-> # センサー代わり
      if result.value > 3
        baba.洗濯をする()
      baba.朝食は食べますか {format: "boolean"}, (result)->
        if result.value is true
          baba.何を食べますか {format: "list", list: ["パン", "ご飯", "コーンフレーク"]}, (result)->
            if result.value is "パン"
              baba.パンをトースターに入れる()
              baba.お湯をわかす ()->
                baba.コーヒーを入れる()
            else if result.value is "コーンフレーク"
              baba.牛乳を用意する()
              baba.皿にコーンフレークと牛乳を投入する()