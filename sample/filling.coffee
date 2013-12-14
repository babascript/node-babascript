{BabaScript} = require "../lib/babascript"
baba = new BabaScript("baba")
filling = ()->
  baba.書類の種類はなんですか {format: "list", list:["領収書", "講義資料", "研究費申請書類", "広告", "その他"]}, (type)->
    switch type
      when "領収書"
        baba.書類棚のA番の領収書ファイルに入れておいてください {}, (result)->
          nextFilling()
      when "講義資料"
        baba.書類棚のC番に積んでおいてください {}, (result)->
          nextFilling()
      when "研究費申請書類"
        baba.締切は1ヶ月以内ですか {}, (result)->
          if result is "true"
            baba.あと何日ですか {format: "int"}, (i)->
              if i < 10
                baba.至急連絡してください ()->
                  nextFilling()
              else
                baba.山田の机の上にわかりやすく配置しておいてください {}, ()->
                  nextFilling()
          else
            baba.書類棚のB番に積んでおいてください {}, ()->
              nextFilling()
      when "広告"
        baba.捨ててください {}, (result)->
          nextFilling()
      else
        baba.書類のタイトルは何ですか {format: "string"}, (name)->
          if name.match(/未踏/)?
            baba.机の上にわかりやすく配置しておいてください {}, ()->
              nextFilling()
          else
            baba.山田くんに聞いてください {timeout: 60}, (result)->
              if result.timeout
                nextFilling()
              nextFilling()

nextFilling = ()=>
  console.log("next filling")
  baba.まだ未整理の書類はありますか {format: "bool"}, (result)->
    if result is true
      filling()
    else
      baba.他の仕事をしてください {format: "bool"}, (result)->
        baba.workDone()

filling()
