path = require "path"
Baba = require path.resolve "../../lib/main"
# Baba = require "../../lib/main"
_ = require "underscore"
members = new Baba.Script "baba"


list = [
  "月曜1限", "月曜2限", "月曜3限" , "月曜4限", "月曜5限", "月曜6限",
  "火曜1限", "火曜2限", "火曜3限" , "火曜4限", "火曜5限", "火曜6限",
  "水曜1限", "水曜2限", "水曜3限" , "水曜4限", "水曜5限", "水曜6限",
  "木曜1限", "木曜2限", "木曜3限" , "木曜4限", "木曜5限", "木曜6限",
  "金曜1限", "金曜2限", "金曜3限" , "金曜4限", "金曜5限", "金曜6限"
]

# 複数選択UIが必要になりそう


members.参加可能な日程を選んでください (result)->
  result.worker.こんばんわ (result)->
    console.log result
#   console.log result
# members.hoge ->
#   console.log "hige"
#   console.log @
  
# console.log members
# members.exec "参加可能な日程を選んでください", {}, (result)->
#   console.log "ie-i"
#   console.log result.value

# members.参加可能な日程を選んでください {format: "sList", list: list, broadcast: 10}, (result)->
	# true の数を数える
  # trueが一番多い部分を選ぶ
  # xな人に対し、時間をずらせないか問いかける
    # true なら