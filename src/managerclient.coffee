Request = require "request"
Client  = require "./client"
# API = "http://localhost:3000/api"
API = "http://linda.babascript.org"

# Babascript::Manager::Server
# Babascript::Manager::Client
# 分離させてしまっても良いかも。



class ManagerClient
  users: []

  constructor: (@groupName)->
    @getUsers()

  getUsers: ->
    option =
      url: "#{API}/group/#{@groupName}/member"
    @users = []
    res = [{id: "baba"}, {id: "usuki"}, {id: "nakazono"}]
    for u in res
      @users.push @createClient(u)
    # Request.get option, (err, res, body)=>
    #   throw err if err
    #   # users = JSON.parse body
    #   for user in users
    #     @createClient user


  createClient: (user)->
    c = new Client @groupName
    c.id = user.id
    if user.sid?
      c.type = "web"
    else
      c.type = "mobile"
    c.status = c.linda.tuplespace @groupName
    c.mediator = c.linda.tuplespace user.id
    c.on "get_task", @getTask
    c.on "cance_task", @cancelTask
    c.mediator.read {type: "status"}, (err, result)=>
      throw err if err
      @statusCheck result
      c.mediator.watch {type: "status"}, @statusCheck
    return c

  getTask: (result)->
    console.log "get task!!"
    console.log result
    # console.log @type
    # console.log result
    @mediator.write result
    @mediator.take {cid: result.cid, type: "return"}, (err, r)=>
      console.log r.data.value
      # console.log "mediator take"
      # console.log r
      @returnValue r.data.value
    option =
      method: "POST"
      uri: "#{API}/notification/name/#{@id}"
      json:
        userid: @id
        message: result
    Request.post option, (err, res, body)=>
      throw err if err
      # @mediator.take {cid: result.cid, type: "return"}, (err, r)=>
      #   throw err if err
      #   @returnValue r.data.value
    # if @type is "web"
    #   @mediator.write result
    #   @mediator.take {cid: result.cid, type: "return"}, (err, r)=>
    #     @returnValue r.data.value
    # else
    #   option =
    #     method: "POST"
    #     uri: "#{API}/notification/name/#{@id}"
    #     json:
    #       userid: @id
    #       message: result
    #   Request.post option, (err, res, body)=>
    #     throw err if err
    #     @mediator.take {cid: result.cid, type: "return"}, (err, r)=>
    #       throw err if err
    #       @returnValue r.data.value

  cancelTask: (result)->

  statusCheck: (err, result)->
    console.log "status"
    console.log result

module.exports = ManagerClient
