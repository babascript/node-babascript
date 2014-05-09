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


Manager = require "manager"

username = "baba"
password = "hogefuga"

Manager.getUser username, (user)->
  user instanceof User

Manager.login username, password, (result)->
  # session管理をここで
  Manager.getUser "name", (user)->
    user.save() → update
    user.remove() → delete # su user
  Manager.createUser "name", "password" (user)->
  Manager.getGroup "name", (group)->
    group.save()
    group.remove()
  Manager.createGroup "name", (group)->

Manager.attach app
# app 経由は、普通のSessionStoreで