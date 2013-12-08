BabaScript = require "../babascript"
babas = new BabaScript "baba"
yamada = new BabaScript "yamada"

babas.たまご買ってきてください {format: "bool", broadcast: 1}, (result, info)->
  console.log result
  console.log info
  yamada.ほげふが (result, info)->
    console.log result, info
    console.log "いえーい"
    yamada.workDone()
  # yamada.てすとてすと {format: "bool"}, ->
  #   console.log "いえーい"
  # babas.晩御飯はどれが良いですか {format: "list", broadcast: 1, list: ["オムライス", "たまごかけご飯", ""]}, (r)->
  #   console.log r
