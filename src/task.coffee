module.exports = class Task

  constructor: (id, key, args) ->
    @data =
      baba: 'script'
      name: id
      key: key
      type: 'eval'
      cid: @createCallbackId()
      format: args?.format or 'boolean'
      at: Date.now()
      options: {}
    for k, v of args
      if k is 'broadcast'
        @data.type = 'broadcast'
        @data.count = v - 1
      else if k is 'timeout'
        @data.timeout = v
      else
        @data.options[k] = v

  get: (key) ->
    return @data[key]

  toTuple: ->
    return @data

  createCallbackId: ->
    return "#{(new Date()/1000)}_#{Math.random(100000)}"
