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

server = http.createServer (req, res)->
  if url.parse(decodeURI(req.url), true) is "/"
    res.writeHead 200
    res.end 'babacscript manager test server'

test_name = "baba_test_#{Date.now()}"
test_pass = "hoge_fuga_#{Date.now()}"
test_group_name = "test_group_#{Date.now()}"

describe "manager test", ->

  it "manager create", (done)->
    assert.notEqual Manager, null
    done()

  it "User Create", (done)->
    attrs =
      username: test_name
      password: test_pass
    Manager.createUser attrs, (status, user)->
      assert.ok status
      assert.ok user instanceof User
      assert.equal test_name, user.get "username"
      p = Crypto.createHash("sha256").update(test_pass).digest("hex")
      assert.equal p, user.get("password")
      done()

  it "User get", (done)->
    Manager.getUser test_name, (user)->
      assert.ok user instanceof User
      assert.equal test_name, user.get('username')
      done()

  it "User authenticate", (done)->
    Manager.getUser test_name, (user)->
      user.authenticate test_pass, (result)->
        console.log result
        assert.ok result
        assert.ok user.isAuthenticate
        done()

  it "User authenticate fail", (done)->
    Manager.getUser test_name, (user)->
      user.authenticate test_pass+"010101001", (result)->
        assert.ok !result
        assert.ok !user.isAuthenticate
        done()

  it "User password modify", (done)->
    Manager.getUser test_name, (user)->
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
    Manager.getUser test_name, (user)->
      p = test_pass+"hogefugahogefuga"
      user.authenticate p, (result)->
        assert.ok !result
        p += "hoge"
        user.changePassword p, (result)->
          assert.ok !result
          done()

  it "User twitter account modify", (done)->
    twittername = "takumibaba"
    Manager.getUser test_name, (user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        user.changeTwitterAccount twittername, (u)=>
          assert.equal user.get("twitter"), twittername
          done()

  it "get user's twitter account", (done)->
    Manager.getUser test_name, (user)->
      account = user.get "twitter"
      assert.equal account, "takumibaba"
      done()

  it "User twitter account modify fail", (done)->
    twittername = "takumibaba12"
    Manager.getUser test_name, (user)->
      user.changeTwitterAccount twittername, (result, user)->
        assert.ok !result
        assert.equal user, null
        done()

  it "User mail address modify", (done)->
    mailaddress = "mail@babascript.org"
    Manager.getUser test_name, (user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        user.changeMailAddress mailaddress, (result, user)->
          assert.ok result
          assert.equal user.get("mail"), mailaddress
          done()

  it "get user's mail account", (done)->
    Manager.getUser test_name, (user)->
      mail = user.get "mail"
      assert.equal mail, "mail@babascript.org"
      done()

  it "mail address modify failed", (done)->
    mailaddress = "mail22@babascript.org"
    Manager.getUser test_name, (user)->
      user.changeMailAddress mailaddress, (result, user)->
        assert.ok !result
        assert.equal user, null
        done()

  it "manager-user delete", (done)->
    Manager.getUser test_name, (user)->
      user.authenticate test_pass, (result)->
        assert.ok result
        name = user.get "username"
        assert.ok user instanceof User
        assert.equal name, user.get('username')
        user.delete name, test_pass, (result)->
          assert.ok result
          Manager.getUser test_name, (user)->
            assert.equal user, null 
            done()

  it "create new group", (done)->
    Manager.createUser {username: test_name, password: test_pass}, (user)->
      attrs =
        name: test_group_name
        owner: user
        members: user
      assert.ok user instanceof User
      Manager.createGroup attrs, (group)->
        assert.ok group instanceof Group
        console.log group
        assert.equal group.get("name"), test_group_name
        assert.equal group.get("owner")[0], user
        done()

  it "get group", (done)->
    done()

  it "check new group's owner", (done)->
    done()

  it "get group's name", (done)->
    done()

  it "add groups member", (done)->
    done()

  it "add groups members", (done)->
    done()

  it "check groups members", (done)->
    done()

  it "remove groups member", (done)->
    done()

  it "delete groups", (done)->
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


  # it "manager-user find", (done)->
  #   name = "baba"
  #   Manager.getUser
  #   Manager.User.read name, (user)->
  #     username = user.get "username"
  #     assert.ok user instanceof User
  #     assert.equal name, username
  #     done()

  
  # it "manager-user delete", (done)->
  #   name = "baba_test"
  #   pass = "hogefuga"
  #   Manager.User.delete 

  # it "user create", (done)->
  #   username = "baba"
  #   password = "takumi"


  # it "user create", (done)->
  #   username = "baba"
  #   password = "takumi"
  #   User.create username, password, (user)->
  #     assert.equal user instanceof User, true
  #     assert.equal user.get("username"), username
  #     user.save (data)->
  #       User.find "baba", (u)->
  #         assert.equal u.get("username"), user.get("username")
  #         # assert.equal u.get("id"), user.get("id")
  #         done()

  # it "group create", (done)->
  #   name = "test_masuilab_group"
  #   Group.create name, (group)->
  #     assert.equal group instanceof Group, true
  #     assert.equal group.get("name"), name
  #     assert.equal group.getMembers().length, 0
  #     done()

  # it "group name", (done)->
  #   name = "test_masuilab_group"
  #   Group.find name, (group)->
  #     assert.equal group instanceof Group, true
  #     assert.equal group.get("name"), name
  #     done()

  # it "group remove", (done)->
  #   name = "test_masuilab_group"
  #   Group.find name, (group)->
  #     assert.equal group instanceof Group, true
  #     group.delete (result)->
  #       assert.equal result, true
  #       done()