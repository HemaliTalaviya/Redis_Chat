require('dotenv').config()
const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app)
global.io = require('socket.io')(server)
const usercontroller = require('./controller/chatController');
const redis = require('redis');

// Define express.json() middleware above routes
app.use(express.json());
global.redisClient = redis.createClient();
redisClient.connect();
redisClient.on('connect', function () {
    console.log('connected redis')
})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

io.on('connection', (socket) => {

    socket.on('SET_USER_NAME', async (name) => {

        if(!name){
            return io.to(socket.id).emit('SET_USER_NAME',{message:'please enter valid name'})
        }
        let userData = {
            name: name,
            socketId: socket.id
        }
        // console.log('userData====', userData)
        let userID = await usercontroller.createUSer(userData)
        let usersData = await usercontroller.findAllUser();
      
        socket.userId = userID;
        // console.log('socket userid==', socket.userId)
       let users=[];
       usersData.forEach((data)=>{
        users.push(JSON.parse(data.value))
            // console.log('userDATA log=',user)
        })
        io.to(socket.id).emit('SET_USER_NAME', {users,userId:userID})
    })


    socket.on('USER_LIST', async () => {
        let usersData = await usercontroller.findName();
        // console.log('all data users =',usersData) 
       let users=[];
       usersData.forEach((data)=>{
        users.push(JSON.parse(data.value))
        })
        // console.log('all user name list ===',users)
        io.emit('USER_LIST', users)
    })


    socket.on('SEND_MSG', async(data)=>{
        
        console.log('send msg backend data==',data)
        // console.log('socket userId=',socket.userId)
        data.sender = socket.userId;
        // console.log('send message =',data)
        let key = 'msg:'+socket.userId+':'+data.receiver
        let dataget =await redisClient.get(key);
        
        if(!dataget){
            key = 'msg:'+data.receiver+':'+socket.userId
            dataget =await redisClient.get(key);
        }
    
        if(dataget){
            dataget = JSON.parse(dataget)
            dataget.push({
                sender:socket.userId,
                rec:data.receiver,
                msg:data.message,
            })
        }else{
            dataget = [{
                sender:socket.userId,
                rec:data.receiver,
                msg:data.message,
            }]
        }
        await redisClient.set(key,JSON.stringify(dataget));

        io.to(socket.id).emit('SEND_MSG',data)

        let receiverObj = await redisClient.get('users:'+data.receiver);
        receiverObj = JSON.parse(receiverObj)
        io.to(receiverObj.socketId).emit('SEND_MSG',data)
        
    })

    socket.on('CHAT_HIS', async(data)=>{
        // console.log('user id=',socket.userId);
        data.sender = socket.userId;
        let key = 'msg:'+socket.userId+':'+data.receiver
        let dataget =await redisClient.get(key);
        
        if(!dataget){
            key = 'msg:'+data.receiver+':'+socket.userId
            dataget =await redisClient.get(key);
        }
        // console.log('dataget event =',dataget)
        io.to(socket.id).emit('CHAT_HIS',JSON.parse(dataget))
        // let receiverObj = await redisClient.get('users:'+data.receiver);
        // receiverObj = JSON.parse(receiverObj)
        // console.log('receiver object=',receiverObj)
        // io.to(receiverObj.socketId).emit('CHAT_HIS',dataget)
    })

    socket.on('change_receiver_color',async (data) => {
        console.log('backend change color data===',  data)
        const receiverId = data.receiver;
        console.log('receiver Id',receiverId);
        io.to(socket.id).emit('change_receiver_color', data);
    });


})

const port = process.env.PORT || '5000'
server.listen(port, () => console.log('Listening port on...!!!', port))

// module.exports = app;
// module.exports = redisClient