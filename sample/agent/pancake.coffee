Baba = require "../../lib/main"

baba = new Baba.Script "baba"

# 食材を用意
baba.小麦粉を190g用意してください()
baba.砂糖を25g用意してください()
baba.ベーキングパウダーを10g用意してください()
baba.塩を3g用意してください()
baba.バターを25g用意してください()
baba.牛乳を330g用意してください()
baba.卵を2個用意してください()

# 調理段階
baba.用意した小麦粉と砂糖とベーキングパウダーと塩をボウルに入れてください (result)->
  if !result.value
    baba.用意した小麦粉と砂糖とベーキングパウダーと塩をボウルに入れてください arguments.callee
  else
    baba.混ぜあわせてください ->
      baba.新しいボウルを用意してください ->
        baba.バターを新しいボウルに入れて溶かしてください ->
          baba.牛乳と卵をバターの入ったボウルに入れてください ->
            baba.混ぜてください