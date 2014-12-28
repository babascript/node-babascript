'use strict'

mm = require 'methodmissing'
BabaScript = require './script'

module.exports = class NodeBabaScript extends BabaScript
  constructor: (id, options) ->
    super id, options
    return mm @, (key, args) =>
      @methodMissing key, args
