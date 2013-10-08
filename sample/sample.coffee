BabaScript = require "../babascript"

baba = new BabaScript()

console.log baba
baba.please_contribute "babascriptForNode", (result)->
	console.log result
