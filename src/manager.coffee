mongoose = require "mongoose"
mongoose.connect "mongodb://localhost/babascript/manager"
_ = require "underscore"
Crypto = require "crypto"

# linda を組み込む
# localな分散処理機構を組み合わせる
# 人リソースの管理もする
  
class Manager
  isAuthenticate: false
  user: null

  constructor: ->

  authenticate: (@username, @password, callback)->
    throw Error "username is undefined" if !@username
    throw Error "password is undefined" if !@password
    pass = Crypto.createHash("sha256").update(@password).digest "hex"
    UserModel.findOne {username: username, password: pass}, (err, user)->
      throw err if err
      return throw Error "user is not defined" if !user?
      

  getUser: (username)->
    user = new User username

  getGroup: (groupname)->

class User
  isAuthenticate: false
  data: {}
  constructor: ->

  @find = (username, callback)->
    throw Error "username is undefined" if !username
    u = new User()
    UserModel.findOne {username: username}, (err, user)=>
      throw err if err
      u.data = user
      return callback null if !user
      return callback u

  @authenticate = (username, password,callback)->
    throw Error "username is undefined" if !username
    throw Error "password is undefined" if !password
    UserModel.findOne {username: username, password: password}, (err, user)=>
      throw err if err
      u = new User()
      u.isAuthenticate = true
      u.data = user
      return callback null if !user
      return callback u

  @create = (username, password,callback)->
    throw Error "username or password is undefined" if !username or !password
    UserModel.findOne {username: username}, (err, user)->
      throw err if err
      return callback false if !user
      u = new User()
      pass = Crypto.createHash("sha256").update(password).digest("hex")
      u.data = new UserModel()
      u.data.username = username
      u.data.password = pass
      callback u

  authenticate: (username, password,callback)->
    throw Error "username is undefined" if !username
    throw Error "password is undefined" if !password
    UserModel.findOne {username: username, password: password}, (err, user)=>
      throw err if err
      @isAuthenticate = true
      return callback false if !user
      return callback @

  save: (callback)->
    @data.save (err)=>
      throw err if err
      callback @

  set: (name, data)->
    @data[name] = data

  get: (name)->
    return @data[name]

  addGroup: (name, callback)->
    return callback false if !@data
    GroupModel.findOne {name: name}, (err, group)=>
      throw err if err
      return callback false if !group
      g = _.find @data.groups, (group)->
        return group.name is name
      @data.groups.push group._id if !g
      @data.save (err)->
        throw err if err
        member = _.find group.members, (m)->
          return m._id is @data._id
        group.members.push @data._Id if !member
        group.save (err)->
          throw err if err
          callback @data
    #   UserModel.findOne {username: @get("username")}, (err, user)->
    #     throw err if err
    #     return callback false if !user

    # group = _.find @data.groups, (group)->
    #   return group.name is name
    # return callback false if group
    # group = new Group()
    # group.find (g)->
    #   if !g
    #     group.name = name
    #     group.members = []
    #     group.save (err)->
    #       throw err if err
    #       user.groups.push group
    #       user.save (err)->
    #         throw err if err
    #         callback group
    #   else
    #     user.groups.push g
    #     user.save (err)->
    #       throw err if err
    #       callback g

  removeGroup: (name, callback)->
    return callback false if !@data or !@username
    GroupModel.findOne {name: name}, (err, group)->
      throw err if err
      UserModel.findOne {username: @username}, (err, user)->
        throw err if err
        for i in [0..user.groups.length-1]
          user.groups.split i, 1 if user.groups[i].name is name
        user.save (err)->
          throw err if err
          callback true

  getDevice: (uuid, callback)->
    if @data
      callback @data, @data.device
    else
      @find {username: @username}, (err, user)->
        throw err if err
        callback user, user.device

  addDevice: (device, callback)->
    @getDevice device.uuid, (user, device)->
      return true if device
      device = new DeviceModel()
      device.uuid = device.uuid
      device.type = device.type
      device.token = device.token
      device.endpoint = device.endpoint
      device.owner = user._id
      device.save (err)->
        throw err if err
        user.device = device
        user.save (err)->
          throw err if err
          callback device

  removeDevice: (uuid, callback)->
    @getDevice uuid, (user, device)->
      return false if !device
      user.device = null
      user.save (err)->
        throw err if err
        callback true

class Group
  data: {}
  constructor: ->

  @create = (name, callback)->
    throw Error "name is undefined" if !name
    GroupModel.findOne {name: name}, (err, group)->
      throw err if err
      return callback false if group
      group = new Group()
      group.data = new GroupModel()
      group.data.name = name
      return group

  @find = (name, callback)->
    throw Error "name is undefined" if !name
    g = new Group()
    GroupModel.findOne {name: name}, (err, group)->
      throw err if err
      g.data = group
      return callback null if !group
      return callback g

  get: (name)->
    return @data[name]

  fetch: (callback)->
    return false if !@groupname or !@data
    GroupModel.findOne {name: @groupname}, (err, group)=>
      throw err if err
      callback false if !group
      @data.name = group.name
      @data.members = group.members
      callback @data

  delete: (callback)->
    GroupModel.findOne {name: @get("name")}, (err, group)->
      throw err if err
      callback false if !group
      group.remove()
      callback true

  save: (callback)->
    @data.save (err)=>
      throw err if err
      callback @

  addMember: (name, callback)->
    throw Error "name is undefined" if !name
    UserModel.findOne {username: name}, (err, user)=>
      throw err if err
      return callback null if !user
      member = _.find @data.members, (m)->
        return m.toString() is user._id.toString()
      @data.members.push user._id if !member
      @data.save (err)=>
        throw err if err
        id = @data._id
        group = _.find user.groups, (group)->
          return group.toString() is id
        user.groups.push id if !group
        user.save (err)->
          throw err if err
          callback @data

  removeMember: (name, callback)->
    throw Error "name is undefined" if !name
    UserModel.findOne {username: name}, (err, user)=>
      throw err if err
      return callback null if !user
      flag = false
      for i in [0..@data.members.length-1]
        if @data.members[i].toString() is user._id.toString()
          @data.members.splice i, 1
          break
      data = @data
      @data.save (err)->
        throw err if err
        console.log "save!"
        for i in [0..user.groups.length-1]
          if user.groups[i].toString() is data._id.toString()
            user.groups.splice i, 1
            break
        user.save (err)->
          throw err if err
          callback data

  getMembers: (callback)->
    q = GroupModel.findOne({name: @data.name})
    q.populate("members", "username device")
    q.exec (err, group)->
      throw err if err
      callback group.members

UserModel = mongoose.model "user", new mongoose.Schema
  username: type: String
  password: type: String
  device: type: {type: mongoose.Schema.Types.ObjectId, ref: "device"}
  groups: type: [{type: mongoose.Schema.Types.ObjectId, ref: "group"}]

GroupModel = mongoose.model "group", new mongoose.Schema
  name: type: String
  members: type: [{type: mongoose.Schema.Types.ObjectId, ref: "user"}]

DeviceModel = mongoose.model "device", new mongoose.Schema
  uuid: type: String
  type: type: String
  token: type: String
  endpoint: type: String
  owner: type: {type: mongoose.Schema.Types.ObjectId, ref: "user"}

module.exports =
  User: User
  Group: Group
  Manager: Manager