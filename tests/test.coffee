process.env.NODE_ENV = 'test'

path = require 'path'
assert = require 'assert'

describe 'test', ->

  script = require path.resolve()
  {Baba} = script

  # it 'should be hoge', ->
  #   return assert.equal 'hoge', new Baba