Baba = require "../../lib/main"
manager = new Baba.Manager "mitoh"
baba = new Baba.Script manager

list = ["ペペロンチーノ", "カルボナーラ", "トマトクリーム", "ボロネーゼ"]
baba.どれを作りますか {format: "list", list: list}, (data)->
  console.log data.value
  if data.value is "ペペロンチーノ"
    baba.パスタ鍋に水を入れ沸騰させる();
    baba.パスタ鍋にパスタを投入する ()->
      setTimeout ->
        baba.湯切りする()
        baba.具材を炒める()
        baba.フライパンにパスタを投入する()
        baba.適度に混ぜる ->
          baba.皿に盛りつける()
      , 1000*5