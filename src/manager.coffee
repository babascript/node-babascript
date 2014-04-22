mongoose = require "mongoose"
mongoose.connect "mongodb://localhost/babascript/manager"
_ = require "underscore"

class Manager

  constructor: ->
    

  getUser: (username)->
    user = new User username


  getGroup: (groupname)->

class User
  data: {}
  constructor: (@username)->

  find: (callback)->
    return false if !@username
    UserModel.findOne {username: @username}, (err, user)=>
      throw err if err
      callback user

  save: ->
    return false if !@username
    @find (user)->
      user = new UserModel() if !user
      user[username] = @username
      for key, value of @data
        user[key] = value
      user.save (err)=>
        throw err if err
        return true

  set: (name, data)->
    @data[name] = data

  get: (name)->
    return @data[name]

class Group
  data: {}
  members: []
  constructor: (@groupname)->

  find: (callback)->
    return false if !@groupname
    GroupModel.findOne {name: @groupname}, (err, group)->
      throw err if err
      callback group

  save: ->
    return false if @groupname
    @find (group)->
      group = new GroupModel() if !group

  addMember: (name)->

    @members.push membername

  removeMember: (membername)->
    for i in [0..@members.length-1]
      @members.splice i, 1 if @members[i] is membername



UserModel = mongoose.model "user", new mongoose.Schema
  username: type: String
  password: type: String
  groups: type: [{type: mongoose.Schema.Types.ObjectId, ref: "group"}]

GroupModel = mongoose.model "group", new mongoose.Schema
  name: type: String
  members: type: [{type: mongoose.Schema.Types.ObjectId, ref: "user"}]


# u = new User()
# u.set "username", "baba"
# u.set "password", "takumi"
# u.save()

i = new User "baba"


group = new Group "g"
for i in ["a", "b", "c"]
  group.addMember i
console.log group.members
group.removeMember "b"
console.log group.members