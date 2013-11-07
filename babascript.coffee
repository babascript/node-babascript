mm = require "methodmissing"
crypto = require "crypto"
Linda = require("node-linda-client")
moment = require "moment"
sys = require "sys"

class Baba

	constructor: (base, space)->
		@base = base || "linda.masuilab.org:10010"
		@space = space || "takumibaba"
		@linda = new Linda.LindaClient @base
		@ts = new Linda.TupleSpace "takumibaba", @linda
		baba = mm @, (key, args)=>
			@__noSuchMethod key, args
		return baba
	
	__noSuchMethod: (key, args)=>
		return sys.inspect @ if key is "inspect"
		@humanExec(key, args)
		
	humanExec: (key, args)=>
		throw Error("last args should callback function") if typeof args[args.length-1] isnt 'function'
		@linda.io.once "connect", =>
			cid = @callbackId()
			tuple = ["babascript", "eval", key, [], {"callback": cid}]
			for arg in args
				if typeof arg is 'function'
					callback = arg
				else
					tuple[3].push arg
			@ts.write tuple
			@ts.take ["babascript", "return", cid], (result, info)=>
				callback(result)
		@linda.connect()

	callbackId: ->
		return crypto.createHash("md5").update("#{moment().diff(@linda.time)}#{moment().unix()}_#{Math.random(1000000)}", "utf-8").digest("hex")

module.exports = Baba
