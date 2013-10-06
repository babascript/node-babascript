mm = require "methodmissing"

class Baba

	constructor: ()->
		console.log "hoge"

	__noSuchMethod: (key, args)->
		console.log key, args

baba = new Baba()
module.exports = mm baba, baba.__noSuchMethod