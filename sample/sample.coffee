BabaScript = require "../babascript"
baba = new BabaScript("http://linda.masuilab.org/", "geta6")


r = []
c = 3
baba.進捗どうですか {format: "bool"}, (result, info)=>
  console.log result
