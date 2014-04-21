Baba = require "../../lib/main"

members = new Baba.Script "baba"

id = members.てすと (result)->
  if result.value is "cancel"
    console.log "cancel..."
  else
    console.log result.value
b = members.ほげふが (result)->
  console.log result.value



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