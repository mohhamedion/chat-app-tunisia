const express  = require("express");
const app  = express();
const port = process.env.PORT||8000 ;
const path = require('path')

const server = app.listen(port,()=>{
    console.log('working on '+port)
})
const io = require("socket.io")(server);

let queue = [];
let inChat = [];
 


app.use(express.static(path.join(__dirname+'/public')));


io.on('connection',(socket)=>{
    socket.join(socket.id);

    console.log(socket.id+" joind socket")

        socket.on("queue",(data)=>{

            console.log(`the queue before `)
            console.log(queue);

            if(queue.length>=1){
                if(data.id!==queue[0].id){

                   
                        io.to(data.id).emit("joinRoom",{room:queue[0].id+data.id,name:queue[0].name});
                        io.to(queue[0].id).emit("joinRoom",{room:queue[0].id+data.id,name:data.name});
                        inChat[data.id] = queue[0].id+data.id;
                        inChat[queue[0].id] = queue[0].id+data.id;
    
                       GetUserFromQuere(queue[0].id);
                }
                
            }else{
                queue.push({name:data.name,id:data.id});
                console.log(`user ${data.name} standing in the queue of id of ${data.id}`);

            }
            console.log(`the queue now `)
            console.log(queue);

        })



    socket.on("joinChatRoom",(data)=>{
        socket.join(data.room);
        io.to(data.room).emit('connected')
    })



    socket.on("messageToServer",(data)=>{
         io.to(data.room).emit("messageToClient",data);
    })



 socket.on("disconnect",()=>{
    console.log('disconnect')
 
    console.log('current room')

      let ChatRoom=inChat[socket.id];

    
    console.log(inChat);
// let ChatRoom= Object.entries(io.sockets.adapter.rooms);
 
try{
    
     io.to(ChatRoom).emit("getOut");
     delete inChat[socket.id];
    console.log(inChat)
    io.sockets.clients(ChatRoom).forEach(function(s){
        s.leave(ChatRoom);
    });

}catch(e){

 }
  
    GetUserFromQuere(socket.id);
    console.log('the queie now is')
    console.log(queue);

})



socket.on('otherPeerDisconected',()=>{


    console.log('current room')

    let ChatRoom=inChat[socket.id];

  
  console.log(inChat);
// let ChatRoom= Object.entries(io.sockets.adapter.rooms);

try{
  
   socket.to(ChatRoom).emit("getOut");
   delete inChat[socket.id];
  console.log(inChat)
  io.sockets.clients(ChatRoom).forEach(function(s){
      s.leave(ChatRoom);
  });

}catch(e){

}

  GetUserFromQuere(socket.id);
  console.log('the queie now is')
  console.log(queue);


})



////

socket.on("typing",(data)=>{
    socket.to(data.room).emit("typing");
    
})




////DATA FILE SHARE


// socket.on('send', function(req) {
//     socket.to(req.data.room).emit('message', {
//         message: req.data.message,
// 		author: req.data.author
//     });
// })

socket.on('signal', (req)=>{
    //Note the use of req here for emiting so only the sender doesn't receive their own messages
    console.log(req);
	socket.to(req.room).emit('signaling_message', {
        type: req.type,
		message: req.message
    });
})

socket.on('files', (req)=> {
	socket.to(req.room).emit('files', {
		filename: req.filename,
		filesize: req.filesize
	});
})







})










const  GetUserFromQuere=(SocketId)=>{
    queue.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queue.splice(i,1);
            console.log(Element.name+" has left");
        }
    })
}


app.get('/',(req,res)=>{
     res.sendFile(__dirname + '/index.html');

});


 
