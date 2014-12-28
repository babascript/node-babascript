'use strict'

Reflect = require 'harmony-reflect'
BabaScript = require './script'

proxyFunc = (target, callback) ->
  return Proxy target,
    get: (target, name, receiver) =>
      ele = target[name]
      if ele?
        if Object::toString.call ele is '[object Function]'
          return -> ele.apply null, arguments
        return ele
      else
        return -> callback name, arguments
    set: (target, name, val, receive) ->
      target[name] = val
      return target

window.BabaScript = module.exports = class BrowserBabaScript extends BabaScript
  constructor: (id, option) ->
    super id, option
    return proxyFunc @, (key, args) =>
      @methodMissing key, args
