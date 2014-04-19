Baba = require "../../lib/main"

members = new Baba.Script "baba"

id = members.てすと (result)->
  if result.value is "cancel"
    console.log "hogeeeee"
  else
    console.log "year?"
console.log "next!"
b = members.ほげふが (result)->
  console.log "ieeeeeeei"
setTimeout ->
  console.log "timeout"
  console.log id
  console.log b
  members.cancel b
  setTimeout ->
    members.cancel id
  , 2000
, 5000
# members.発表はありますか {broadcast: "all"}, (results)->
#   presenters = _.filter results, (r)->
#     return r.value is true
#   agenda = ->
#     questions = []
#     presenter = presnters.pop()
#     presnter.登壇してください (result)->
#       cid = setTimeout ->
#         presenter.終了です()
#       , 1000*60*60
#       members.質問を入力してください {broadcast: "all", format: "string"}, (result)->
#         questions.push result.value