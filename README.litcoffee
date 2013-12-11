# BabaScript for node.js

* BabaScript は人力処理環境のためのプログラミングライブラリです

## initialize
    
    {BabaScript} = require "./lib/babascript"
    baba = new BabaScript "baba"

## baba.methodName(args={}, callback)

* methodName 部分が命令としてワーカーに通知される
* 第一引数に命令に関するオプション、第二引数にコールバック関数を指定する
 
    baba.進捗どうですか (result)->
      console.log result

## baba.methodName({format: "boolean"}, callback)

* 返り値の型を指定する
* デフォルト値は boolean

    baba.進捗どうですか {format: "boolean"}, (result)->
      console.log result

## baba.methodName({timeout: num}, callback)

* timeout は、時間に応じて命令をキャンセルする
* num 秒後に命令をキャンセルする

    baba.進捗どうですか {timeout: 100}, (result)->
      console.log result

## baba.methodName({broadcast: num}, callback)

* broadcast は、全babaに対して命令を送る
* numで指定された数だけ値が返ってくるまで待つ

    baba.進捗どうですか {broadcast: 3}, (result)->
      console.log result

## callback(result, human(people?))

* 返り値: result.value 
* 返した人: result.worker(Person Object)
* result.worker.methodName で、返した人にまた命令を送れる
  
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




