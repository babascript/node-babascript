Baba = require "../../lib/main"

baba = new Baba.Script "takumibaba"
docs = ["領収書", "講義資料", "研究費申請書類", "広告", "その他"]
filling = ()->
  baba.書類の種類はなんですか {format: "list", list: docs}, (result)->
    switch result.value
      when "領収書"
        baba.書類棚のA番の領収書ファイルに入れておいてください {format: "boolean"}, (result)->
          nextFilling()
      when "講義資料"
        baba.書類棚のC番に積んでおいてください {}, (result)->
          nextFilling()
      when "研究費申請書類"
        baba.締切まであと何日ですか {format: "int"}, (result)->
          if result.value < 10
            baba.至急連絡してください {}, ->
              nextFilling()
          else
            baba.書類棚のB番に積んでおいてください {}, ()->
              nextFilling()
      when "広告"
        baba.捨ててください {}, (result)->
          nextFilling()
      else
        baba.書類のタイトルは何ですか {format: "string"}, (result)->
          name = result.value
          if name.match(/未踏/)?
            baba.机の上にわかりやすく配置しておいてください {}, ()->
              nextFilling()
          else
            baba.山田くんに聞いてください {}, (result)->
              nextFilling()

nextFilling = ()=>
  console.log("next filling")
  baba.まだ未整理の書類はありますか {format: "bool"}, (result)->
    if result.value is true
      filling()
    else
      baba.他の仕事をしてください {format: "bool"}, (result)->
        process.exit()

filling()
