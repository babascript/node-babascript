Baba = require "../../lib/main"

manager = new Baba.Manager "masuilab"
members = new Baba.Script manager

members.発表はありますか {broadcast: "all"}, (results)->
  presenters = _.filter results, (r)->
    return r.value is true
  agenda = ->
    questions = []
    presnter = presenters.pop()
    presenter.登壇してください (result)->
      cid = setTimeout ->
        pid = presenter.終了です {format: "void"}
        psid = presenters.質疑応答の準備をしてください {broadcast: "all", format: "void"}
        presenters.質疑は終わりましたか (result)->
          if result.value
            presenter.cancel pid
            presenters.cancel psid
            agenda()
          else
            presenters.質疑は終わりましたか arguments.callee
        members.cancel id
      , 1000*60*60
      id = members.質問を入力してください {broadcast: "all", format: "string"}, (result)->
        return if result.value is "cancel"
        questions.push result.value
        id = members.質問を入力してください {broadcast: "all", format: "string"}, arguments.callee
