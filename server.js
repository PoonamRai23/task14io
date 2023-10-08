const express= require('express')
const app=express()
const path=require('path')

const sequelize=require('./util/chatAPP')
const userRouter =require('./routes/user')

const user = require("./models/user");
const chat = require("./models/chatApp");
const group=require("./models/group")
const groupMembers=require("./models/groupMember")
const jwt=require('jsonwebtoken')
const bodyparser=require('body-parser')
const chatRoute = require("./routes/chatAPP");
const groupRoute = require("./routes/group");
const io = require('socket.io')(3000)

const users = {}

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})

const cors=require('cors')
app.use(cors())
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
 app.use(express.static(path.join(__dirname,'views')))

 app.use('/',userRouter)
app.use('/',chatRoute)
app.use('/',groupRoute)

//one to many relation
user.hasMany(chat)
chat.belongsTo(user);

user.hasMany(groupMembers);
groupMembers.belongsTo(user);

group.hasMany(groupMembers);
groupMembers.belongsTo(group);

group.hasMany(chat);
chat.belongsTo(group);




sequelize.sync({alter:true})
.then(()=>{
    

    app.listen(3000)
}) 
.catch((error)=>{
    console.log(error)

})


