mm = require "methodmissing"
BabaScript = require "./babascript"
baba = new BabaScript()
baba.hoge "fuga", ()->
	console.log "hoge"
