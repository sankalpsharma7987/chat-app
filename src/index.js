const http=require('http')
const express=require('express');
const socketio=require('socket.io')
const path=require('path');
const wordFilter=require('bad-words')
const {generateMessage}=require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users.js')


const app=express();
const server=http.createServer(app)
const port=process.env.PORT

//Setup Socket
//Socketio requires a http server instance to be used. When express creates it behind the scene, we do not have accesss to it. So we had to create one to use with socketio
const io=socketio(server)



//Setup Static directory to serve
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{

        socket.on('join',({username,room},callback)=>{
const {error,user}=addUser({id:socket.id,username,room})

if(error)
{
    return callback(error)
}
            socket.join(user.room)

            socket.emit('message',generateMessage('Admin',`Welcome!`))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

    callback()

        })

    
    socket.on('sendMessage',(message,callback)=>{
        
        //socket.broadcast.emit will send broadcast message to everyone,except to the socket that just joined
        const filter=new wordFilter()

       
    if(filter.isProfane(message))
    {
        return callback('Profanity is not allowed')
    }
     

       
           //Retrieve user
           const user=getUser(socket.id) 
           if(!user)   
           {
            
            return callback('Invalid user details')
           }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()

    });

socket.on('sendLocation',({latitude,longitude},callback)=>{
    const user=getUser(socket.id)
    
    io.to(user.room).emit('locationMessage',generateMessage(user.username,`https://www.google.com/maps?q=${latitude},${longitude}`))
    callback()
})
    socket.on('disconnect',()=>{
    const user=removeUser(socket.id)

    if(user)
    {
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
        
    })
    
})


//Code to start the server.
server.listen(port,()=>{
    console.log('Server is listening on port '+port);
})