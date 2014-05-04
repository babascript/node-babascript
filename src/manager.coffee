mongoose = require "mongoose"
mongoose.connect "mongodb://localhost/babascript/manager"
_ = require "underscore"
Crypto = require "crypto"
LindaSocketIO = require("linda-socket.io")
Linda = LindaSocketIO.Linda
TupleSpace = LindaSocketIO.TupleSpace

# linda を組み込む
# localな分散処理機構を組み合わせる
# 人リソースの管理もする
# Manager を立ち上げると、...?
# Lindaと同じような実装にする？
# Manager に接続するためのコードが必要？

# framework for Node.js express 

class BBLinda extends Linda 
  constructor: ->
    @spaces = {}
    @sids = {}

  tuplespace: (name)->
    return @spaces[name] ||
           @spaces[name] = new TupleSpace(name)

  listen: ()->

  write: (data)=>
  read:  (data)=>
  take:  (data)=>
  watch: (data)=>
  cancel: (data)=>

class BBTupleSpace extends TupleSpace
  constructor: (@name='noname')->
    super(@name)
  _write: (tuple, options={expire: Tuple.DEFAULT.expire}) ->
    @write tuple, options
  _read: (tuple, callback) ->
    @read tuple, callback
  _take: (tuple, callback) ->
    @take tuple, callback
  _watch: (tuple, callback) ->
    @watch tuple, callback


# Manager には、Manage-client と、 babascript と babascriptclient
# この3種が接続する。
class Manager
  constructor: (io, server)->
    @linda = Linda.listen {io: io, server: server}
    @linda.io.on "connection", (socket)=>
      socket.on "disconnect", (data)=>
      socket.on "__linda_write", (data)=>
      socket.on "__linda_take", (data)=>
      socket.on "__linda_cancel", (data)=>


  attach: (@app)->
    @app.post "/api/user/new", @User._create
    @app.get  "/api/user/:name", @User._read # 一部login
    @app.put  "/api/user/:name", @User._update # login
    @app.delete "/api/user/:name", @User._delete # login

    @app.post "/api/group/new", @Group._create # login
    @app.get  "/api/group/:name", @Group._read # login
    @app.put  "/api/group/:name", @Group._update # owner only
    @app.delete "/api/group/:name", @Group._delete # owner only

  Session:
    _login: (req, res)->

    login: (username, password, callback)->
      User.find username, password, (result)->

  User:
    _create: (req, res)=>
      attrs =
        name: req.body.name
        password: req.body.password  
      @create attrs, res.json
    create: (attrs, callback)=>
      User.create attrs.name, attrs.password, (user)->
        data = if !user then {status: false} else {status: true, user: user}
        callback data
    _read: (req, res)=>
      @read req.params.name, res.json
    read: (name, callback)=>
      User.find name, (user)->
        return callback user
    _update: (req, res)=>
      attrs =
        name: req.params.name
        data: req.body.attrs
      @update name, data, res.json
    update: (attr, callback)=>

    _delete: (req, res)=>
      @delete req.aprams.name, res.json
    delete: (name, callback)=>
      User.find name, (user)->
        status = false
        if user
          user.remove()
          status = true
        callback status

  Group:
    _create: (req, res)=>
      attrs =
        name: req.body.name
        owner: req.body.owner
      @create attrs , res.json
    create: (attrs, callback)=>
      Group.create attrs.name, attrs.owner, (result)->
        
    _read: (req, res)=>
      name = req.params.name
      @read name, res.json
    read: (name, callback)=>
      Group.find name, (result)->
        return callback result
    _update: (req, res)=>
    update: (name, attr)=>
    _delete: (req, res)=>
    delete: (name)=>

class User
  isAuthenticate: false
  username: ""
  password: ""
  groups: []
  constructor: ->


  @find = (username, callback)->
    throw new Error "username is undefined" if !username
    u = new User()
    UserModel.findOne {username: username}, (err, user)=>
      throw err if err
      u.data = user
      return callback null if !user
      return callback u

  @find = (username, password, callback)->
    throw new Error "username is undefined" if !username
    throw new Error "password or callbakc is undefined" if !username
    if typeof password is 'function'
      console.log "normal normal"
    else if typeof password is 'string' and typeof callback is 'function'
    console.log 'loggined user'


  @authenticate = (username, password,callback)->
    throw new Error "username is undefined" if !username
    throw new Error "password is undefined" if !password
    UserModel.findOne {username: username, password: password}, (err, user)=>
      throw err if err
      return callback null if !user
      u = new User()
      u.isAuthenticate = true
      u.data = user
      return callback u

  @create = (username, password, callback)->
    throw new Error "username is undefined" if !username
    throw new Error "password is undefined" if !password
    UserModel.findOne {username: username}, (err, user)->
      throw err if err
      return callback false if !user
      u = new User()
      pass = Crypto.createHash("sha256").update(password).digest("hex")
      u.data = new UserModel()
      u.data.username = username
      u.data.password = pass
      u.save (err)->
        throw err if err
        u.isAuthenticate = true
        callback u

  authenticate: (password,callback)->
    throw new Error "username is undefined" if !@username
    throw new Error "password is undefined" if !password
    UserModel.findOne {username: @username, password: password}, (err, user)=>
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
    throw new Error "name is undefined" if !name
    GroupModel.findOne {name: name}, (err, group)->
      throw err if err
      return callback false if group
      group = new Group()
      group.data = new GroupModel()
      group.data.name = name
      return group

  @find = (name, callback)->
    throw new Error "name is undefined" if !name
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
    throw new Error "name is undefined" if !name
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
    throw new Error "name is undefined" if !name
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
  twitter: type: String
  mail: type: String
  device: type: {type: mongoose.Schema.Types.ObjectId, ref: "device"}
  groups: type: [{type: mongoose.Schema.Types.ObjectId, ref: "group"}]

GroupModel = mongoose.model "group", new mongoose.Schema
  name: type: String
  owners: type: [{type: mongoose.Schema.Types.ObjectId, ref: "user"}]
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