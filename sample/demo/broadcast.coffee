{BabaScript} = require "../../lib/babascript"
_ = require "underscore"
mitohMembers = new BabaScript "mitoh"

lunch = ["和食", "洋食", "中華", "その他"]
mitohMembers.昼食何が良いですか {format: "list", list: lunch, broadcast: 4}, (results)->
  workers = []
  r = {}
  for result in results
    r[result.value]
    if !r[result.value]?
      r[result.value] = []
    r[result.value].push result.worker
  winners = _.max r, (d)->
    return d.length
  manager = _.sample winners
  manager.予約してください {format: "boolean"}, (result)=>
    if result.value is true
      console.log "終わり"
      process.exit()
    else if result.value is false
      manager = _.sample winners
      manager.予約してください {format: "boolean"}, arguments.callee
