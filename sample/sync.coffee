Baba = require "../lib/script"

yamada = new Baba "yamada", {manager: "http://localhost:9080"}

#yamada.attributes.on "change_data", (data) ->
#  console.log "change data!!"
#  console.log data

#yamada.attributes.on "get_data", (data) ->
#  console.log 'get_data'
#  console.log data

yamada.events.on "ready go", ->
  console.log yamada.attributes.get("yamada")
  console.log yamada.membernames
  yamada.attributes.get("yamada").on "change_data", (data) ->
    console.log "change_data"
    console.log data
    if data.level > 10
      yamada.attributes.get("yamada").set "job", "master", {sync: true}
      yamada.いえーい {}, (result) ->
        console.log yamada.attributes.get("yamada").get 'job'
        console.log result
#  console.log yamada.attributes.get "level"
#  yamada.attributes.set "count", 3
