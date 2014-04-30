process.env.NODE_ENV = "test"

path = require "path"
assert = require "assert"
Baba = require "../lib/main"
User = Baba.Manager.User
Group = Baba.Manager.Group
_    = require "underscore"

describe "manager test", ->

  it "user create", (done)->
    username = "baba"
    password = "takumi"
    User.create username, password, (user)->
      assert.equal user instanceof User, true
      assert.equal user.get("username"), username
      user.save (data)->
        User.find "baba", (u)->
          assert.equal u.get("username"), user.get("username")
          # assert.equal u.get("id"), user.get("id")
          done()

  it "group create", (done)->
    name = "test_masuilab_group"
    Group.create name, (group)->
      assert.equal group instanceof Group, true
      assert.equal group.get("name"), name
      assert.equal group.getMembers().length, 0
      done()

  it "group name", (done)->
    name = "test_masuilab_group"
    Group.find name, (group)->
      assert.equal group instanceof Group, true
      assert.equal group.get("name"), name
      done()

  it "group remove", (done)->
    name = "test_masuilab_group"
    Group.find name, (group)->
      assert.equal group instanceof Group, true
      group.delete (result)->
        assert.equal result, true
        done()