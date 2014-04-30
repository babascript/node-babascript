path = require "path"
Baba = require path.resolve "../../lib/main"
async = require "async"
_ = require "underscore"
vc = new Baba.VC "masuilab"

members = new Baba.Script vc
list = [
  "月曜1限", "月曜2限", "月曜3限" , "月曜4限", "月曜5限", "月曜6限",
  "火曜1限", "火曜2限", "火曜3限" , "火曜4限", "火曜5限", "火曜6限",
  "水曜1限", "水曜2限", "水曜3限" , "水曜4限", "水曜5限", "水曜6限",
  "木曜1限", "木曜2限", "木曜3限" , "木曜4限", "木曜5限", "木曜6限",
  "金曜1限", "金曜2限", "金曜3限" , "金曜4限", "金曜5限", "金曜6限"
]

# 複数選択UIが必要になりそう

MEMBER = 3

members.参加可能な日程を選んでください {broadcast: MEMBER}, (results)->
  console.log results
  workers = _.pluck results, "worker"
  b = []
  work = []
  console.log workers
  for i in [0..workers.length-1]
    worker = workers[i]
    b.push (callback)=>
      a = []
      for date in list
        worker.参加可能ですか {description: date}, (result)->
          a.push result.value
          if result.task.description is "金曜6限"
            callback null, a
  async.parallel b, (err, result)->
    len = result[0].length-1
    b = {}
    for i in [0..len]
      a = []
      for k in [0..result.length-1]
        a.push result[k][i]
      c = _.reject a, (bool)->  
        return bool is false
      b[list[i]] = c.length
    m = _.max b, (n)->
      return n.val
    if m[0].length >= MEMBER
      members.以下の日程から開催日時を選んでください {description: m}, (result)->
        process.exit()
    else
      funcs = []
      funcs.push (args)=>
        if args.length is 1
          i = 1
        for k in [0..MEMBER-1]
          if !m[i][k]
            members.get(k).以下の日程になりそうですが、調整できませんか {description: list[i]}
        callback i
      async.waterfall funcs, (result)->
        console.log result