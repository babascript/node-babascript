# BabaScript for node.js

* BabaScript は人力処理環境のためのプログラミングライブラリです

[![Travis CI Status Badge](https://travis-ci.org/babascript/node-babascript.png?branch=master)](https://travis-ci.org/babascript/node-babascript)

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


# TODO マニュアルをちゃんと書く