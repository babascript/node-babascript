#BabaScript for node


## Manager

### User

Create
Read
Update
  device
  group
Delete
Log


### Group

Create
Read
Update
  members
Delete
Log


manager = new Manager()
manager.login name, password, ->
  console.log @isAuthenticated
  console.log @username, @password
  console.log @
manager.getUser "baba", (err, user)->
  console.log user