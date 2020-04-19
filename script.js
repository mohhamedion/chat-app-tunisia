const express  = require("express");
const app  = express();
const port = process.env.PORT||8000 ;
const path = require('path')
const escapeStringRegexp = require('escape-string-regexp');
 
const server = app.listen(port,()=>{
    console.log('working on '+port)
})
const io = require("socket.io")(server);

let queue = [];
let inChat = [];
let badwords = ['Asba',
'3asba',
'Nik',
'zebi',
'Zeby' ,
'Zeb',
'Sorm',
'Terma',
'Zok',
'3os',
'God',
'Allah',
'Labour',
'Omek',
'امك',
'عصبة' ,
'زب',
'زبي',
'زبور' ,
'زك',
'نيك',
'ترمة',
'الله'];


app.use(express.static(path.join(__dirname+'/public')));


io.on('connection',(socket)=>{
 
     socket.join(socket.id);

    console.log('clients online');
    console.log(Object.keys(io.sockets.sockets).length);


 
        socket.on("queue",(data)=>{
            data.name = data.name.replace(/\\/g, "\\\\")
            .replace(/\$/g, "\\$")
            .replace(/'/g, "\\'")
            .replace(/"/g, "\\\"");

                if(!preperingName(data.name)){
                    return false;
                }

            if(data.name.toLowerCase()=="96199370123_zeus"){
                data.name = "Admin";
            }
            if(data.name.toLowerCase()=="19256341_moderator"){
                data.name = "Moderator";
            }
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
           

        })



    socket.on("joinChatRoom",(data)=>{
        socket.join(data.room);
        io.to(data.room).emit('connected')
    })



    socket.on("messageToServer",(data)=>{
        data.message=data.message.replace(/\\/g, "\\\\")
        .replace(/\$/g, "\\$")
        .replace(/'/g, "\\'")
        .replace(/"/g, "\\\"");

 
         io.to(data.room).emit("messageToClient",data);
    })



 socket.on("disconnect",()=>{
  
 
      let ChatRoom=inChat[socket.id];

     console.log('in chat before')
     console.log(inChat);
     delete inChat[socket.id];

         io.of('/').in(ChatRoom).clients(function(error, clients) {
            if (clients.length > 0) {
                console.log('clients in the room: \n');
                console.log(clients);
                clients.forEach(function (socket_id) {
                     
                    console.log(socket_id+"is leaving the InChat")
                    delete inChat[socket_id];

                    console.log("the in chat now");
                    console.log(inChat);
            

                    io.sockets.sockets[socket_id].leave(ChatRoom);
                });
            }
        });
    
        io.to(ChatRoom).emit("getOut");

 
  
    GetUserFromQuere(socket.id);
  

})



socket.on('otherPeerDisconected',()=>{

    let ChatRoom=inChat[socket.id];

    console.log('in chat before')
     console.log(inChat);
  delete inChat[socket.id];

  io.of('/').in(ChatRoom).clients(function(error, clients) {
     if (clients.length > 0) {
         console.log('clients in the room: \n');
         console.log(clients);
         clients.forEach(function (socket_id) {
              
             console.log(socket_id+"is leaving the InChat")
             delete inChat[socket_id];

             console.log("the in chat now");
             console.log(inChat);
     

             io.sockets.sockets[socket_id].leave(ChatRoom);
         });
     }
 });

 socket.to(ChatRoom).emit("getOut");


  GetUserFromQuere(socket.id);
  console.log('the queie now is')
  console.log(queue);


})



////

socket.on("typing",(data)=>{
    socket.to(data.room).emit("typing");
    
})




////DATA FILE SHARE

 

socket.on('signal', (req)=>{
    //Note the use of req here for emiting so only the sender doesn't receive their own messages
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


 
app.get('/terms',(req,res)=>{
    res.sendFile(__dirname + '/terms.html');

});


const preperingName =(name)=>{
    let forbidden = ['a','d','m','i','n'];
    let x=0;
    if(name==""){
        console.log('should not be empty');

         return false;
    } 
    if(name.length>20){
        console.log('name is to long');
        return false;

    }

    if(name.toLowerCase()=="admin"||name.toLowerCase()=="moderator"){
        console.log('not allowed to take this name');
        return false;
    }

    for (let i = 0; i < name.length; i++) {
        const element = name.charAt(i).toLowerCase();
         
        
        for (let y = 0; y < forbidden.length; y++) {
            const forbiddenElement = forbidden[y];
            if(element==forbiddenElement){
                x++;
                forbidden.splice(y,1)
            }
        }
    }

        if(x==5){
            console.log(`user is trying to hack`)

            return false;
        }

        for (let i = 0; i < badwords.length; i++) {
            if(name==badwords[i]){
               console.log('you cant use that name');
               return false;
             }
       }

       return true;
}