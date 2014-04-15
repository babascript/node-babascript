Baba = require "../../lib/main"

# manager = new Baba.Manager 'masuilab'
baba = new Baba.Script "baba"
baba.defaultFormat = "string"
back = (d)->
  baba.次の論文を探してください {format: "boolean"}, (result)->
    baba.研究のタイトルは関連してそうですか {format: "boolean"}, d

check = (result, next)->
  if !result.value
    baba.次の論文を探してください {format: "boolean"}, ->
      start()
  else
    next()
# 読む価値があるかどうかの確認
start = ->
  baba.研究のタイトルは関連してそうですか {format: "boolean"}, (result)->
    check result, ->
      baba.アブストラクトの内容は関連してそうですか {format: "boolean"}, (r)->
        check r, ->
          baba.システム図などから関連性はありそうですか {format: "boolean"}, (r)->
            check r, ->
              readAbstract()

# 実際に読む
abstract = ""
readAbstract = ->
  baba.研究のタイトルは何ですか (result)->
    title = result.value
    baba.この研究の目的は何ですか (result)->
      abstract += "目的は#{result.value}。"
      baba.この研究は何を対象としたものですか (result)->
        abstract += "#{result.value}を対象とした研究だ。"
        baba.どのような手法を用いたのか (result)->
          abstract += "手法としては、#{result.value}"
          baba.どのような結果がわかったのか (result)->
            abstract += "結果として、#{result.value}"
            readIntroduction()

introduction = ""
readIntroduction = ->
  baba.この研究で取り上げている問題はなんですか (result)->
    introduction += "この研究の問題は、#{result.value}"
  baba.なぜこの研究が必要なのですか (result)->
    introduction += "この研究は、#{result.value}のような理由で必要である。"
  baba.過去の同系統の研究の存在は記述されていますか {format: "boolean"}, (result)->
    if result.value
      baba.従来の研究ではどんな手法を用いていますか (result)->
        introduction += "過去には以下のような手法が試されてきた。#{result.value}"
      baba.従来の研究にはどんな問題や未解明の点がありますか (result)->
        introduction += "しかし、以下のような問題が存在する。#{result.value}"
    baba.この研究の目的は何ですか  (result)->
      introduction += "この研究では、以下の目的を達成する。#{result.value}"
      baba.前の目的を達成するためにどのような手法を用いていますか  (result)->
        introduction += "この研究では、#{result.value} などの手法を用いて目的を達成する。"
        baba.提案手法ではどのような事実がわかったのか (result)->
          introduction += "結果、以下の事実がわかった。 #{result.value}"
          baba.事実から得られる結論はなにか (result)->
            introduction += "結論として、#{result.value} であるといえる。"
            readMethod()

method = ""
readMethod = ->
  baba.提案手法についての章を見てください {format: "void"}, (result)->
    baba.何を作りましたか (result)->
      method += "提案手法を実現するために、#{result.value}を作った。"
      baba.どのようなシステム構成ですか (result)->
        method += "システムは以下のように構成される。#{result.value}"
        baba.提案手法では何ができるようになりますか (result)->
          method += "提案手法では以下のことが可能となる。#{result.value}"
          baba.提案手法の特徴は何ですか (result)->
            method += "提案手法は以下のような特徴を持つ。#{result.value}"
            baba.提案手法は何が新しいのか (result)->
              method += "提案手法は、以下の様な新規性をもつ。#{result.value}"
              readEvaluation()

evaluation = ""
readEvaluation = ->
  baba.評価実験の項目はありますか {format: "boolean"}, (result)->
    if !result.value
      evaluation = "評価実験はしていません。"
      readRelated()
    else
      evaluation = "評価実験では、以下のような実験を行い、結果を得ています。"
      baba.何を確かめる実験ですか (result)->
        evaluation += "この評価実験では、#{result.value}の検証を行っている。"
        baba.どのような実験タスクを行うのか (result)->
          evaluation += "この評価実験は以下のようなものだ。#{result.value}"
          baba.実験には何か条件がありますか (result)->
            evaluation += "以下のような条件のもと、評価実験が行われた。#{result.value}"
            baba.実験の手順はどうなっていますか (result)->
              evaluation += "手順は以下の通りだ。#{result.value}"
              baba.実験の結果を簡単にまとめてください (result)->
                evaluation += "結果は以下のようになった。#{result.value}"
                baba.実験の結果の考察を簡単にまとめてください (result)->
                  evaluation += "実験結果から、以下のような考察が可能。#{result.value}"
                  readRelated()

relatedPaper = ""
readRelated = ->
  baba.関連研究の項目はありますか {format: "boolean"}, (result)->
    if !result.value
      readOutroduction()
    else
      baba.関連研究を一つづつ列挙していきます {format: "void"}, (result)->
        relatedSearch = ->
          baba.重要そうな関連研究はありますか {format: "boolean"}, (result)->
            if !result.value
              readOutroduction()
            else
              baba.その研究について一文でまとめてください (result)->
                readRelated += "以下のような研究が関連として存在する。#{result.value}"
              relatedSearch()
        relatedSearch()

outroduction = ""
readOutroduction = ->
  baba.結論を読みます {format: "void"}, (result)->
    baba.この論文は何をしましたか (result)->
      outroduction += "この論文では、#{result.value}についての報告である。"
      baba.明らかになったことはなんですか (result)->
        outroduction += "#{result.value}ということがわかった。"
        baba.問題はなにか見つかりましたか (result)->
          outroduction += "以下のような問題点の発見にもつながった。#{result.value}"
          baba.今後の展望について簡単に記述してください (result)->
            outroduction += "今後は、以下のようなことを検討していく。#{result.value}"
            eop()
eop = ->
  console.log "--- 概 要 ---"
  console.log abstract
  console.log "---はじめに---"
  console.log introduction
  console.log "---提案手法---"
  console.log method
  console.log "---評価実験---"
  console.log evaluation
  console.log "---関連研究---"
  console.log relatedPaper
  console.log "---おわりに---"
  console.log outroduction
  baba.まだ論文を読みますか {format: "boolean"}, (result)->
    if result.value
      baba.新しい論文を探してください {format: "void"}, start
    else
      console.log "おわり"
      process.exit()

start()