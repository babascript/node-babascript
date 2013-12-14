{BabaScript} = require "../lib/babascript"
babas = new BabaScript "baba"
yamada = new BabaScript "yamada"
# console.log LindBase

babas.たまご買ってきてください {format: "bool", broadcast: 1}, (result)->
  worker = result.worker
  console.log worker
  worker.いえい {}, (result)->
    console.log result
  yamada.ほげふが {}, (result)->
    console.log result
    console.log "いえーい"
  # yamada.てすとてすと {format: "bool"}, ->
  #   console.log "いえーい"
  # babas.晩御飯はどれが良いですか {format: "list", broadcast: 1, list: ["オムライス", "たまごかけご飯", ""]}, (r)->
  #   console.log r
