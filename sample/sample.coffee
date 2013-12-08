BabaScript = require "../babascript"
baba = new BabaScript("baba")
#タイトル・日付をカレンダーに登録→true or false
# baba.展示説明をする {format: "boolean"}, (result, info)=>
#   console.log result
#   if result == "true"
#     console.log "説明ご苦労さまです"
#   else
#     baba.必ず説明してくれ {format:"boolean"}, (result,info)->
#       if result is "true"
#         console.log "ありがとうございます"
#       else
#         console.log "人の行動をプログラムに埋め込むことができる人力処理環境です。"
#         console.log "人への命令構文を追加可能なライブラリと、その命令を受け取り、値を返すことのできるアプリケーションを組み合わせることで実現します"
#         console.log "プログラム側から人へ働きかけられることによって、人を実世界とのインタフェースとして扱ったり、人を効率的に運用することが可能になります"

baba.進捗どうですか {format: "boolean"}, (result, info)->
  if result is true
    console.log "良い進捗ですね"
  else
    console.log "進捗ダメです"
    baba.もう一度進捗はどうなんですか {format: "boolean"}, (result, info)->
      console.log "そうですか"
      baba.workDone()

