process.env.NODE_ENV = "test"

path = require "path"
assert = require "assert"
Crypto = require "crypto"
Baba = require "../lib/main"
User = Baba.Manager.User
Group = Baba.Manager.Group
Manager = Baba.Manager.Manager
_    = require "underscore"
http = require 'http'
url = require 'url'
express = require 'express'

test_name = "baba_test_#{Date.now()}"
test_pass = "hoge_fuga_#{Date.now()}"
test_group_name = "test_group_#{Date.now()}"

describe "manager program test", ->

  it "manager create", (done)->
    assert.notEqual Manager, null
    done()

  it "User Create", (done)->
    attrs =
      username: test_name
      password: test_pass
    Manager.createUser attrs, (err, user)->
      assert.equal err, null
      assert.ok user instanceof User
      username = user.get("username")
      assert.equal test_name, user.get "username"
      p = Crypto.createHash("sha256").update(test_pass).digest("hex")
      assert.equal p, user.get("password")
      done()

  it "User get", (done)->
    Manager.getUser test_name, (err, user)->
      assert.equal err, null
      assert.ok user instanceof User
      assert.equal test_name, user.get('username')
      done()

  it "User authenticate", (done)->
    Manager.getUser test_name, (err, user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        assert.ok user.isAuthenticate
        done()

  it "User authenticate fail", (done)->
    Manager.getUser test_name, (err, user)->
      user.authenticate test_pass+"010101001", (result)->
        assert.ok !result
        assert.ok !user.isAuthenticate
        done()

  it "User password modify", (done)->
    Manager.getUser test_name, (err, user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        oldpass = user.get "password"
        newpass = test_pass+"0101"
        user.changePassword newpass, (result)->
          _newpass = Crypto.createHash("sha256").update(newpass).digest "hex"
          p = user.get "password"
          assert.ok result
          assert.notEqual p, oldpass
          assert.equal p, _newpass
          test_pass = test_pass+"0101"
          done()

  it "User password modify fail", (done)->
    Manager.getUser test_name, (err, user)->
      p = test_pass+"hogefugahogefuga"
      user.authenticate p, (result)->
        assert.ok !result
        p += "hoge"
        user.changePassword p, (result)->
          assert.ok !result
          done()

  it "attributes: User twitter account modify", (done)->
    twittername = "takumibaba"
    Manager.getUser test_name, (err, user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        user.set "twitter", twittername
        user.save (err)->
          assert.equal @get("twitter"), twittername
          assert.equal @get("username"), test_name
          done()

  it "attributes: get user's twitter account", (done)->
    Manager.getUser test_name, (err, user)->
      account = user.get "twitter"
      assert.equal account, "takumibaba"
      done()

  it "attributes: User twitter account modify fail", (done)->
    twittername = "takumibaba12"
    Manager.getUser test_name, (err, user)->
      user.set "twitter", twittername
      user.save (err)->
        assert.ok err instanceof Error
        assert.equal "takumibaba", @get "twitter"
        done()

  it "attributes: User mail address modify", (done)->
    mailaddress = "mail@babascript.org"
    Manager.getUser test_name, (err, user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        user.set "mail", mailaddress
        user.save (err)->
          assert.equal err, null
          m = @get "mail"
          assert.equal m, mailaddress
          assert.ok @ instanceof User
          done()

  it "attributes: get user's mail account", (done)->
    Manager.getUser test_name, (err, user)->
      mail = user.get "mail"
      assert.equal mail, "mail@babascript.org"
      done()

  it "attributes: mail address modify failed", (done)->
    mailaddress = "mail22@babascript.org"
    Manager.getUser test_name, (err, user)->
      user.set "mail", mailaddress
      user.save (err)->
        assert.ok err instanceof Error
        assert.equal @, user
        assert.ok @ instanceof User
        done()

  it "manager-user delete", (done)->
    Manager.getUser test_name, (err, user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        name = user.get "username"
        assert.ok user instanceof User
        assert.equal name, user.get('username')
        user.delete name, test_pass, (result)->
          assert.ok result
          Manager.getUser test_name, (err, user)->
            assert.equal user, null 
            done()

  it "create new group", (done)->
    Manager.createUser {username: test_name, password: test_pass}, (err, user)->
      attrs =
        name: test_group_name
        owner: user
        members: user
      assert.ok user instanceof User
      Manager.createGroup attrs, (status, group)->
        assert.ok group instanceof Group
        assert.equal group.get("name"), test_group_name
        assert.equal group.get("owners").shift(), user.get "_id"
        done()

  it "get group", (done)->
    Manager.getGroup {name: test_group_name}, (err, group)->
      assert.equal err, null
      assert.ok group instanceof Group
      name = group.get "name"
      assert.equal name, test_group_name
      done()

  it "add group's member", (done)->
    Manager.getGroup {name: test_group_name}, (err, group)->
      assert.equal err, null
      assert.equal 0, group.get("members").length
      Manager.getUser test_name, (err, user)->
        user.authenticate test_pass, (result)->
          assert.ok result 
          group.addMember user, (err, group)->
            assert.equal err, null
            assert.ok group instanceof Group
            members = group.get "members"
            assert.equal 1, members.length
            assert.equal user.get("username"), members[0].username
            done()

  it "remove group's member", (done)->
    Manager.getGroup {name: test_group_name}, (err, group)->
      assert.equal err, null
      Manager.getUser test_name, (err, user)->
        group.removeMember user, (err, group)->
          assert.equal err, null
          assert.ok group instanceof Group
          members = group.get "members"
          assert.equal 0, members.length
          assert.equal null, members[0]
          done()

  it "delete group's", (done)->
    return done()
    Manager.getGroup test_group_name, (group)->
      assert.ok group instanceof Group
      name = gruop.get "name"
      assert.equal name, test_group_name
      Manager.getUser test_name, (user)->
        user.authenticate test_pass, (result)->
          assert.ok result
          group.delete  test_group_name, user, (result)->
            assert.ok result
            done()

app = express()
server = app.listen 3030
io = require('socket.io').listen server

describe "manager app test", ->

  it "attach", (done)->
    Manager.attach io, server, app
    done()  