Baba = require "../../lib/main"

# manager = new Baba.Manager 'masuilab'
baba = new Baba.Script "baba"
async = require "async"

title = ""
abstractText = ""
introductionText = ""
proposalText = ""
baba.defaultFormat = "string"
related = []

baba.研究のタイトルは何ですか (result)->
  title = result.value
  if title.length > 15
    baba.タイトルを15文字以内にしてください arguments.callee
  else
    baba.研究について150文字以内で説明してください (result)->
      text = result.value
      if text.length > 150
        baba.研究について150文字以内で説明してください arguments.callee
      else
        introductionText += text
        baba.なぜこの研究は重要なのですか addIntro
        baba.類似研究の経緯としてはどんなものがありますか addIntro
        baba.今までの研究事例の問題点は何ですか addIntro
        baba.この研究の目的は何ですか addIntro
        baba.目的達成のために何をしましたか addIntro
        baba.何がわかったのか簡単に説明してください (result)->
          addIntro result
          baba.提案手法の概要を説明してください addProposal
          baba.なぜこの手法なのか addProposal
          baba.類似手法はありますか {format: "boolean"}, (result)->
            if result.value
              baba.類似手法との違いはなんですか addProposal
            baba.提案手法の特徴は何ですか addProposal
            baba.提案手法はどのような実装ですか addProposal
            関連研究 ()->
              console.log introductionText
              console.log proposalText
              console.log related
        # baba.関連研究を上げてください 

関連研究 = (done)->
  baba.関連している研究のタイトルはなんですか (result)->
    research =
      title: result.value
    baba.その研究の内容を50文字で説明してください (result)->
      if result.value.length > 50
        baba.再度50文字以内で説明してください arguments.callee
      else
        research["abstract"] = result.value
        baba.自分の提案手法との違いを50文字で説明してください (result)->
          if result.value.length > 50
            baba.再度50文字以内で説明してください arguments.callee
          else
            research["diff"] = result.value
            related.push research
            baba.まだ他に関連研究はありますか {format: "boolean"}, (result)->
              if result.value
                関連研究(done)
              else
                done()   


addIntro = (result)->
  introductionText += result.value
addProposal = (result)->
  proposalText += result.value