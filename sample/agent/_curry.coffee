Baba = require "../../lib/main"

manager = new Baba.Manager "masuilab"
baba = new Baba.Script 'baba'

n = 5

# 材料を集める
getMaterials = ->
  baba.材料を揃える {format: "void"}, ->
    baba.カレールウを100g用意する()
    baba.牛肉を200g用意する()
    baba.玉ねぎ中サイズを1個半用意する()
    baba.にんじん小サイズを1本用意する()
    baba.じゃがいもを1個用意する()
    baba.大きめの鍋を用意する()
    cook()

cook = ->
  baba.鍋をコンロにセットし熱し始める ->
    baba.牛肉を一口サイズ程度の大きさに切る()
    baba.玉ねぎをみじん切りにする()
    baba.にんじんを一口サイズ程度の大きさに切る()
    baba.じゃがいもを一口サイズ程度の大きさに切る()
    baba.鍋の温度は十分に熱せられていますか {format: "boolean"}, (result)->
      c = arguments.callee
      if !result.value
        setTimeout ->
          baba.鍋の温度は十分に熱せられていますか {format: "boolean"}, c
        , 1000*20
      else
        console.log "result true"
        baba.鍋にサラダ油を大さじ2杯垂らす()
        baba.鍋に玉ねぎを入れて炒める()
        baba.鍋ににんじんを入れて炒める()
        baba.鍋にじゃがいもを入れて炒める()
        baba.玉ねぎの色がきつね色になっていますか {format: "boolean"}, (result)->
          c = arguments.callee
          if !result.value
            setTimeout ->
              baba.玉ねぎの色がきつね色になっていますか {format: "boolean"}, c
            , 1000*10
          else
            baba.鍋に水を加える ->
              baba.水は沸騰していますか {format: "boolean"}, (result)->
                c = arguments.calle
                if !result.value
                  setTimeout =>
                    baba.水は沸騰していますか {format: "boolean"}, c
                  , 1000*60*1
                else
                  baba.アクを取ってください {format: "void"}, ->
                    baba.材料が柔らかくなるまで弱火で煮込む {format: "void"}, ->
                      setTimeout =>
                        next()
                      , 1000*1
                      # , 1000*60*15
                    next = ->
                      baba.火を止める ->
                        baba.カレールウを鍋に投入する()
                        baba.カレールウが十分に溶かす ->
                          baba.弱火で煮込む ->
                            baba.調理終了 ->
                              process.exit()
getMaterials()
