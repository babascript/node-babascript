# BabaScript for node.js

* BabaScript は人力処理環境のためのプログラミングライブラリです

## initialize
    
    {Baba} = require "babascript"
    baba = new Baba.Script "baba"

## baba.methodName(args={}, callback)
 
    baba.進捗どうですか {}, (result)->
      console.log result

* methodName 部分が命令としてワーカーに通知される
* 第一引数に命令に関するオプション、第二引数にコールバック関数を指定する

## baba.methodName({format: "boolean"}, callback)

    baba.進捗どうですか {format: "boolean"}, (result)->
      console.log result

* 返り値の型を指定する
* デフォルト値は boolean

## baba.methodName({timeout: num}, callback)

    baba.進捗どうですか {timeout: 100}, (result)->
      console.log result

* timeout は、時間に応じて命令をキャンセルする
* num 秒後に命令をキャンセルする

## baba.methodName({time: "cron-like-option"},callback)

    baba.進捗どうですか {time: "* * * * 10"}, (result)->
      console.log result

# time の value にcron-likeな記法で時間を指定してあげると、その時間にこのメソッドが実行される

## baba.methodName({broadcast: num}, callback)

    baba.進捗どうですか {broadcast: 3}, (result)->
      console.log result

* broadcast は、全babaに対して命令を送る
* numで指定された数だけ値が返ってきたらcallbackが実行される

## callback(result, human(people?))
  
    baba.進捗どうですか {}, (result)->
      value = result.value
      worker = result.worker
      console.log value, worker
      if value
        worker.進捗もっと {}, (result)->
          console.log result.value
      else
        worker.なんで進捗ないんですか {format: "string"}, (result)->
          console.log result.value

* 返り値: result.value 
* 返した人: result.worker(Person Object)
* result.worker.methodName で、返した人にまた命令を送れる

## baba.methodName({unicast: id}, callback)

    baba.進捗どうですか {unicast: "13864372209500.3487349874339998"}, (result)->
      value = result.value
      worker = result.worker #worker is yamada
      worker.やまだくんやまだくん

* unicastオプションは、特定の一人に対して命令を配信する。
* id で指定された相手から命令が返ってきたらcallbackが実行される
* 現状の id はとてもダサいので、変更したい

# BabaScript Client

* BabaScript Client は、BabaScriptからの命令を受け取るためのクライアントです。

## initialize

    {Baba} = require "babascript"
    client = new Baba.Client "name"

## client.on "get_task", callback

    client.on "get_task", (result)->
      # タスクを受け取った時の処理を記述する

* client に get_task という名前でコールバックを登録する
* client が script からの命令を受け取ると、登録されているメソッドが実行される。

## client.returnValue(value)

    client.returnValue true

* returnValue メソッドを用いることで、script側に命令を返すことができる。
* 現在実行中のタスクの返り値

## client.on "cancel_task", callback

    client.on "cancel_task", (task)->
      # タスクがキャンセルされた時の処理を記述する

* script 側の事情で命令がキャンセルされた時、このメソッドが呼ばれる。

#Manager

* モバイルクライアントなどへの命令送信を可能にする仮想クライアント
* データベースに問い合わせ、そこから返ってくる文字列をidとして、Clientを作る
