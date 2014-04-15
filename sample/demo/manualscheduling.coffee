Baba = require "../../lib/main"
_ = require "underscore"
members = new Baba.Script "masuilab"

# 複数選択UIが必要になりそう

members.参加可能な日程を選んでください {format: "sList", list: list, broadcast: 10}, (result)->
	# true の数を数える
  # trueが一番多い部分を選ぶ
  # xな人に対し、時間をずらせないか問いかける
    # true なら