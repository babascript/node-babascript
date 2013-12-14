{BabaScript} = require "../lib/babascript"
babas = new BabaScript "baba"
yamada = new BabaScript "yamada"
# console.log LindBase

babas.たまご買ってきてください {format: "bool", unicast: "13864372209500.3487349874339998"}, (result)->
  worker = result.worker
  console.log worker
  worker.いえい {}, (result)->
    console.log result