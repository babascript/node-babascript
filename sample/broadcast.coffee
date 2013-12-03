BabaScript = require "../babascript"
babas = new BabaScript("takumibaba")

babas.たまご買ってきてください {format: "bool", broadcast: 1}, (result)->
  console.log result
  console.log "hoge"
  babas.晩御飯はどれが良いですか {format: "list", broadcast: 1, list: ["オムライス", "たまごかけご飯", ""]}, (r)->
    console.log r