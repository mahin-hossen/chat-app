require("dotenv").config()
const http = require("http")
const path = require("path")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage,generateLocationMessage} = require("./utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname,"../public")
app.use(express.static(publicDirectoryPath))

io.on("connection",(socket)=>{
    
    //room
    socket.on("join",({username,room},ack) =>{
        const {error,user} = addUser({id:socket.id,username,room})

        if(error){
            return ack(error)
        }

        socket.join(user.room)

        socket.emit("message",generateMessage("Admin","Welcome!"))
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined!`))


        socket.on("disconnect",()=>{
            const user = removeUser(socket.id)

            if(user){
                io.to(user.room).emit("message",generateMessage("Admin",`${user.username} has left!`))
                io.to(user.room).emit("roomData",{
                    room:user.room,
                    users:getUsersInRoom(user.room)
                })
            }            
        })

        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        ack()
    })

    //chat
    socket.on("sendMessage",(message,ack)=>{
        const filter = new Filter()

        if(filter.isProfane(message)){
            return ack("Profanity isn't allowed!")
        }

        
        const user = getUser(socket.id)
        io.to(user.room).emit("message",generateMessage(user.username,message))
        ack()
    })

    //location
    socket.on("sendLocation",(location,ack)=>{

        const user = getUser(socket.id)
        
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))

        ack("Location shared!")
    })
})



//connected
server.listen(process.env.port,()=>{
    console.log("connected")
})