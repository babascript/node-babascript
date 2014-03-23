Baba = require "../../lib/main"

undergraduate = new Baba.Script "masuilab-undergraduate"
master = new Baba.Script "masuilab-master"
masui = new Baba.Script "masui"

questions = []
undergraduate.発表はありますか？ {broadcast: 15}, (results)->
  presenters = _.filter results, (r)->
    return r.value is true
  agenda = ->
    presenter = presenters.pop()
    presenter.登壇してプレゼンしてください (result)->
      cid = setTimeout ->
        presenter.時間です ->
      , 1000*60*10 #10分
      master.質問考えておいてください {broadcast: 3, format: "string"}, (result)->
        questions.push result.value
      undergraduate.質問考えておいてください {broadcast: 5, format: "string"}, (result)->
        questions.push result.value
      presenter.プレゼンは終わりましたか {}, (result)->
        if result.value is false
          arguments.callee(result)
        else