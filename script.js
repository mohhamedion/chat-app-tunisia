const express  = require("express");
const app  = express();
const port = process.env.PORT||8000 ;
const path = require('path')
const session = require('express-session');
const bodyParser  = require('body-parser');
const socketSession = require('express-socket.io-session');
const server = app.listen(port,()=>{
    console.log('working on '+port)
})
const io = require("socket.io")(server);
let queueToAdmin=[];
let queue = [];
let inChat = [];
let admins = [];
let bannedIP = [];
let badwords = [ 'Asba', '3asba', 'Nik', 'zebi', 'Zeby' , 'Zeb', 'Sorm', 'Terma', 'Zok', '3os', 'God', 'Allah', 'Labour', 'Omek', 'امك', 'عصبة' , 'زب', 'زبي', 'زبور' , 'زك', 'نيك', 'ترمة','الله'];

app.use(express.static(path.join(__dirname+'/public')));
app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
// io.use(socketSession(session, {
//     autoSave:true
// })); 


io.on('connection',(socket)=>{
 
     socket.join(socket.id);

    console.log('clients online');
    console.log(Object.keys(io.sockets.sockets).length);

        socket.on("queue",(data)=>{
 
            if(!checkIfBanned(io.sockets.sockets[socket.id].handshake.address)){
                 return;
            }
 
            data.name=escapeHTML(data.name);
                 if(!preperingName(data.name)){
                    return false;
                }

            if(data.name.toLowerCase()=="96199370123_zeus"){
                data.name = "Admin";
      
                admins[socket.id] = {name:data.name,id:socket.id,status:'free'};
                io.emit('adminJoin');
                adminCheckUsers(socket);
                return;
            }
            if(data.name.toLowerCase()=="19256341_moderator"){
                data.name = "Moderator";
                io.emit('adminJoin');
                admins[socket.id] = {name:data.name,id:socket.id,status:'free'};
                adminCheckUsers(socket);
                return;
            }

            
            if(queue.length>=1){
                if(socket.id!==queue[0].id){
 

                       connectTwoUsers(socket,queue[0],data);
                      
                }
                
            }else{
                queue.push({name:data.name,id:socket.id});
                console.log(`user ${data.name} standing in the queue of id of ${data.id} `);

            }
           

        })



    socket.on("joinChatRoom",(data)=>{
        socket.join(data.room);
        io.to(data.room).emit('connected')
    })



    socket.on("messageToServer",(data)=>{
         data.message = escapeHTML(data.message);
 
         io.to(data.room).emit("messageToClient",data);
    })



    // ADMIN SOCKET

    socket.on("joinAdminQueue",(data)=>{
        data.name=escapeHTML(data.name);
        if(!preperingName(data.name)){

           return false;
       }

         if(Object.keys(admins).length>0){

            disconnectUserFromChat(socket);

              for (const [key, admin] of Object.entries(admins)) {
           
                 if(admin.status=='free'){
                     connectTwoUsers(socket,admin,data);
                     admin.status='busy';
                       GetUserFromAdminQuere(socket.id);
                    return false;
                }  

              }
              console.log("ADMIN IS BUSY , PUSING TO ADMIN QUEUE");
              queueToAdmin.push({name:data.name,id:socket.id});

        }else{
            console.log('admin is offline')
        }
               
        

    })




 socket.on("allUsers",()=>{
    socket.emit('allUsers',Object.entries(inChat));
 })
 





 socket.on("kick",(data)=>{
          try{

             console.log('kicking user '+data.id)
             console.log(io.sockets.sockets[data.id].handshake.address)
             bannedIP.push(io.sockets.sockets[data.id].handshake.address);
         
               disconnectUserFromChat(data)
         }catch(e){
             console.log("No user to kick")
         }
         
       

 })
 








//  DISCONECT SOKCET

 socket.on("disconnect",()=>{
let ChatRoom;
  try{
      ChatRoom=inChat[socket.id].room;

  }catch(e){
 
  }
 

  if(admins[socket.id]){
    delete admins[socket.id];
    console.log("admin is disconnection")
    console.log(Object.keys(admins).length)
    if(Object.keys(admins).length==0){
        io.emit("adminOut");
    }
}


delete inChat[socket.id];
         io.of('/').in(ChatRoom).clients(function(error, clients) {
            if (clients.length > 0) {
                console.log('clients in the room: \n');
                console.log(clients);
                clients.forEach(function (socket_id) {
                     
                    console.log(socket_id+"is leaving the InChat")
                    delete inChat[socket_id];

                  
            

                    io.sockets.sockets[socket_id].leave(ChatRoom);
                });
            }
        });
    
        io.to(ChatRoom).emit("getOut");

 
  
    GetUserFromQuere(socket.id);
    GetUserFromAdminQuere(socket.id);
  
  

})



socket.on('otherPeerDisconected',()=>{

    let ChatRoom;
    try{
        ChatRoom=inChat[socket.id].room;
    }catch(e){
          
    }
 
  delete inChat[socket.id];

  io.of('/').in(ChatRoom).clients(function(error, clients) {
     if (clients.length > 0) {
         console.log('clients in the room: \n');
         console.log(clients);
         clients.forEach(function (socket_id) {
              
              delete inChat[socket_id];

               
             io.sockets.sockets[socket_id].leave(ChatRoom);
         });
     }
 });

 socket.to(ChatRoom).emit("getOut");


  GetUserFromQuere(socket.id);
  GetUserFromAdminQuere(socket.id);
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
		filename:req.filename ,
		filesize: req.filesize
	});
})







})




// FUNCTIONS

const checkIfBanned=(ip)=>{
    let status=true;
    console.log(bannedIP);
        for (let i = 0; i < bannedIP.length; i++) {
            const e = bannedIP[i];
            if(e==ip){
                console.log("banned ip is "+bannedIP)
                status=false;
               break;
            }    
        }
        if(status){
            return true;
        }else{
            return false;
        }
}

const disconnectUserFromChat = (socket)=>{
    try{
        let ChatRoom=inChat[socket.id].room;

  
        delete inChat[socket.id];
      
        io.of('/').in(ChatRoom).clients(function(error, clients) {
           if (clients.length > 0) {
               console.log('clients in the room: \n');
               console.log(clients);
               clients.forEach(function (socket_id) {
                    
                    delete inChat[socket_id];
       
                   io.sockets.sockets[socket_id].leave(ChatRoom);
               });
           }
       });
      
       io.to(ChatRoom).emit("getOut");
      
       
        GetUserFromQuere(socket.id);
        GetUserFromAdminQuere(socket.id);
        console.log('the queie now is')
        console.log(queue);
    }catch(e){
            console.log(e)
    }


}



const  GetUserFromQuere=(SocketId)=>{
    
    queue.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queue.splice(i,1);
            console.log(Element.name+" has left");
        }
    })
}



const  GetUserFromAdminQuere=(SocketId)=>{
    queueToAdmin.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queueToAdmin.splice(i,1);
            console.log(Element.name+" has left");
        }
    })
}








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


const escapeHTML =(msg) =>{
    try{
        return msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    }catch(e){
            console.log(e)
    }
 }

 const connectTwoUsers=(firstUser,secondUser,data)=>{
     if(firstUser.id!==secondUser.id){
        io.to(firstUser.id).emit("joinRoom",{room:secondUser.id+firstUser.id,name:secondUser.name});
        io.to(secondUser.id).emit("joinRoom",{room:secondUser.id+firstUser.id,name:data.name});
        inChat[firstUser.id] = {room:secondUser.id+firstUser.id,name:data.name};
        inChat[secondUser.id] = {room:secondUser.id+firstUser.id,name:secondUser.name};
    
       GetUserFromQuere(secondUser.id);
     }

}



const adminCheckUsers = (socket)=>{
    if(admins[socket.id]){
        let admin =  admins[socket.id];

    if(queueToAdmin.length>0){
        connectTwoUsers(socket,queueToAdmin[0],admin);
        GetUserFromAdminQuere(queueToAdmin[0].id)
    }else{
        admin.status="free";
    }

}else{
    console.log('no');
}
}




// ROUTES


app.get('/',(req,res)=>{

if(checkIfBanned(req.connection.remoteAddress)){
    res.sendFile(__dirname + '/index-support.html');

}else{
    res.sendFile(__dirname + '/not-allowed.html');

}

});



app.get('/terms',(req,res)=>{
   res.sendFile(__dirname + '/terms.html');

});
app.get('/support',(req,res)=>{
   res.sendFile(__dirname + '/index-support.html');
});

app.get('/dashboard',(req,res)=>{
      if(req.session.username){
       res.sendFile(__dirname + '/index-dashboard.html');

      }else{
       res.sendFile(__dirname + '/login.html');

      }

    
      
});


app.post("/dashboard",(req,res)=>{

       if(req.body.username=="96199370123_zeus"){
           console.log(req.body);
           req.session.username=req.body.username;
        }
       if(req.body.username=="19256341_moderator"){
           console.log(req.body);
           req.session.username=req.body.username;
       }
       res.redirect("/dashboard");

})


