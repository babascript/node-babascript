path = require "path"
Baba = require path.resolve "../../lib/main"
# Baba = require "../../lib/main"
_ = require "underscore"
manager = new Baba.Manager "masuilab"
members = new Baba.Script manager


# 複数選択UIが必要になりそう
# members.参加可能な日程を選んでください {}, (result)->
members.exec "参加可能な日程を選んでください", {}, (result)->
  console.log "ie-i"
  console.log result.value

# members.参加可能な日程を選んでください {format: "sList", list: list, broadcast: 10}, (result)->
	# true の数を数える
  # trueが一番多い部分を選ぶ
  # xな人に対し、時間をずらせないか問いかける
    # true なら