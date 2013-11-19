BabaScript = require "../babascript"
baba = new BabaScript("http://linda.masuilab.org/", "takumibaba")

r = []
c = 3
baba.進捗どうですか {format: "bool", broadcast: 1, timeout: 10}, (result, info)=>
  console.log result
