Request = require "request"
Client  = require "./client"
API = "http://localhost:3000/api"
class Manager
  users: []

  constructor: (@groupName)->
    @getUsers()

  getUsers: ->
    option =
      url: "#{API}/group/#{@groupName}/member"
    Request.get option, (err, res, body)=>
      throw err if err
      users = JSON.parse body
      for user in users
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
        c.mediator.watch {type: "notify"}, (err, result)=>
          tuple =
            type: "notify2"
            name: result.data.name
            group: @groupName
          c.mediator.write tuple
        @users.push c

  getTask: (result)->
    # console.log "get task!!"
    # console.log @type
    # console.log result
    @mediator.write result
    @mediator.take {cid: result.cid, type: "return"}, (err, r)=>
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

module.exports = Manager