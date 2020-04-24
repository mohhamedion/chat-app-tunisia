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
// var Filter = require('bad-words');

const io = require("socket.io")(server);
let queueToAdmin=[];
let queue = [];
let inChat = [];
let admins = [];
var bannedIP = [];
let badwords = [ 'Asba', '3asba', 'Nik', 'zebi', 'Zeby' , 'Zeb', 'Sorm', 'Terma', 'Zok', '3os', 'God', 'Allah', 'Labour', 'Omek', 'امك', 'عصبة' , 'زب', 'زبي', 'زبور' , 'زك', 'نيك', 'ترمة','الله','Owner','porn','sex','fuck','horny'];
let allUsers = [];

 
 
app.use(express.static(path.join(__dirname+'/public')));
app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
 
 
io.on('connection',(socket)=>{
//joining my own socket id room
socket.join(socket.id);
//emit admin if online
socket.emit("adminStatus",Object.keys(admins).length);



console.log('clients online');
console.log(Object.keys(io.sockets.sockets).length);



        socket.on("queue",(data)=>{
           console.log(data.cookie);
           
           if(data.cookie.length>0){
            if(!checkIfBanned(data.cookie)){
                console.log('user trying to connect');
                console.log('STOP');
                socket.emit('ban',{msg:"you are banned from chat"});
                 return;
            }
           }
      
 
            data.name=escapeHTML(data.name);
                 if(!preperingName(data.name)){
                     socket.emit('ban',{msg:"please change your name"});
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

            
            ///add user 

            if(!allUsers[socket.id]){
                allUsers[socket.id] = {name:data.name,cookie:data.cookie};

            }

            if(queue.length>=1){
                if(socket.id!==queue[0].id){
 

                       connectTwoUsers(socket,queue[0],data);
                       GetUserFromQuere(queue[0].id);
                      

                }
                
            }else{
                queue.push({name:data.name,id:socket.id});
                // console.log(`user ${data.name} standing in the queue of id of ${data.id} `);
                // console.log("queue now 🎁")
                // console.log(queue);
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

    socket.on("joinAdminQueue",   (data)=>{
          // تنضيف الاسم
     
        if(inChat[socket.id]){
            console.log("In chat user joing admin")
            console.log(inChat[socket.id].room)
        }else{
            console.log('not in chat user joing admin')
        }

        data.name=escapeHTML(data.name);
        if(!preperingName(data.name)){

           return false;
       }

         if(Object.keys(admins).length>0){
            //في احتمال يكون بشات او بقائمة الانتظار العادية ! منطلعو منها
               disconnectUserFromChat(socket)

                for (const [key, admin] of Object.entries(admins)) {
           
                    if(admin.status=='free'){
                        connectTwoUsers(socket,admin,data);
                        admin.status='busy';
                        //هون مالو بل كيو بس منكية
                       GetUserFromAdminQuere(socket.id);

                    //    console.log("ADMIN SPEAKING TO USER")
           
                        //حاليا هاد مالو لازمة 
                        // console.log("IN CHAT NOW 🔥 🔥 🔥 🔥 ")
                        // console.log(inChat);
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
    socket.emit('allUsers',{allUsers:Object.entries(allUsers),usersOnline:Object.keys(io.sockets.sockets).length});
 })
 

  



 socket.on("kick",(data)=>{
    try{
    let msg;

    if(data.msg.length>0){
        msg = data.msg;
    }else{
        msg ="please change your name" ;
    }
 
       io.to(data.id).emit('ban',{msg:msg});                     
       if(data.ban){
           console.log('will be banned forever');
        bannedIP.push(allUsers[data.id].cookie);
        }
        disconnectUserFromChat(data)
         badwords.push(data.name);
         console.log(badwords)
        if(allUsers[data.id]){
            delete allUsers[data.id];
        }
    }catch(e){
        console.log("No user to kick")
        console.log(e);
    }
  
     
          // bannedIP.push(io.sockets.sockets[data.id].handshake.address);
         //    io.to(data.id).emit('alert',{msg:"please change your name"});                     


 })
 


socket.on("alertFromAdministration",(data)=>{

    io.to(data.id).emit('alert',{msg:data.msg});                     

})





//  DISCONECT SOKCET

 socket.on("disconnect",()=>{
    console.log("[disconnect] InCHAT  ")
    console.log(inChat)

 let ChatRoom;
 


 if(allUsers[socket.id]){
        delete  allUsers[socket.id];
    }


  if(inChat[socket.id]){
    
    console.log("[disconnect] " +inChat[socket.id].name +" is disconnecting");

    ChatRoom=inChat[socket.id].room;

  }

  if(admins[socket.id]){
    delete admins[socket.id];
    if(Object.keys(admins).length==0){
        io.emit("adminOut");
    }
}
delete inChat[socket.id];

if(ChatRoom){
    console.log(ChatRoom);
     io.of('/').in(ChatRoom).clients(function(error, clients) {
        if (clients.length > 0) {
            // console.log('clients in the room: \n');
            // console.log(clients);
            clients.forEach(function (socket_id) {
                 
                // console.log(socket_id+" is leaving the InChat")

              if(socket.id!==socket_id){
                delete inChat[socket_id];

              }
        

                io.sockets.sockets[socket_id].leave(ChatRoom);
            });
        }
    });
    io.to(ChatRoom).emit("getOut");

  
}
        
GetUserFromQuere(socket.id);
GetUserFromAdminQuere(socket.id);
console.log("[disconnect] in chat now ");
console.log(inChat)

})


////when one of the users pass 
socket.on('otherPeerDisconected',()=>{

    let ChatRoom;
 
    if(inChat[socket.id]){
      console.log("[disconnect] " +inChat[socket.id].name +" is disconnecting");
      ChatRoom=inChat[socket.id].room;
    }
     delete inChat[socket.id];
     if(ChatRoom){
        io.of('/').in(ChatRoom).clients(function(error, clients) {
            if (clients.length > 0) {
               //  console.log('clients in the room: \n');
               //  console.log(clients);
                clients.forEach(function (socket_id) {
                   // console.log(socket_id + " is leaving the InChat")
                       if(socket.id!==socket_id){
                           delete inChat[socket_id];
                       }
                                   
                   //   console.log("[otherPeerDisconected] InCHAT")
                   // console.log(inChat);
       
                    io.sockets.sockets[socket_id].leave(ChatRoom);
                });
            }
        });
     }


     socket.to(ChatRoom).emit("getOut");


  GetUserFromQuere(socket.id);
  GetUserFromAdminQuere(socket.id);
})



////

socket.on("typing",(data)=>{
    socket.to(data.room).emit("typing");
})



socket.on("stopTyping",(data)=>{
    socket.to(data.room).emit("stopTyping");
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




//FUNCTIONS

const checkIfBanned=(ip)=>{
    let status=true;
         for (let i = 0; i < bannedIP.length; i++) {
            const e = bannedIP[i];
            if(e==ip){
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
 
let ChatRoom;
     
 
 if(inChat[socket.id]){
      
    console.log("[disconnectUserFromChat] " +inChat[socket.id].name +" is disconnecting");

    ChatRoom=inChat[socket.id].room;

  }

  delete inChat[socket.id];

  //we here get out the user
  

  if(ChatRoom){
    io.of('/').in(ChatRoom).clients(function(error, clients) {
        if (clients.length > 0) {
         //    console.log('clients in the room: \n');
         //    console.log(clients);
             clients.forEach(function (socket_id) {
                 // console.log(socket_id+" user is leaving the chat");
                 if(socket.id!==socket_id){
                     delete inChat[socket_id];
                     io.to(socket_id).emit("getOut");
                 }
    
                io.sockets.sockets[socket_id].leave(ChatRoom);
             //    console.log("[disconnectUserFromChat] InCHAT  ")
             //    console.log(inChat);
    
            });
        }
    });
  }
      
   
      

          GetUserFromQuere(socket.id);
          GetUserFromAdminQuere(socket.id);
  
}
 



const  GetUserFromQuere=(SocketId)=>{
    
    queue.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queue.splice(i,1);
             
            // console.log("the queue now is: 😍")
            // console.log(queue);
        }
    })
}



const  GetUserFromAdminQuere=(SocketId)=>{
    queueToAdmin.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queueToAdmin.splice(i,1);
         
       
        }
    })
}








const preperingName =(name)=>{
    let forbidden = ['a','d','m','i','n'];
    let x=0;
    name = name.toLowerCase();
    if(name==""){
        // console.log('should not be empty');

         return false;
    } 
    if(name.length>20){
        // console.log('name is to long');
        return false;

    }

    if(name.toLowerCase()=="admin"||name.toLowerCase()=="moderator"){
        // console.log('not allowed to take this name');
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
            // console.log(`user is trying to hack`)

            return false;
        }



        // for (let i = 0; i < badwords.length; i++) {
        //     if(name==badwords[i]){
        //       console.log('you cant use that name');
        //        return false;
        //      }

        // }



        for(let i=0;i<badwords.length;i++){
            let badword=badwords[i];
            badword = badword.toLowerCase();
             if(name.length<badword){
                continue;
              }
              let words = name.split(" ");
           
             for(let x=0;x<words.length;x++){
               if(words.includes(badword)){
                  return false;
               }
               
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


    // if(inChat[firstUser.id]||inChat[secondUser.id]){
    //     return false;
    // }

     if(firstUser.id!==secondUser.id){
  
        io.to(firstUser.id).emit("joinRoom",{room:secondUser.id+firstUser.id,name:secondUser.name});
        io.to(secondUser.id).emit("joinRoom",{room:secondUser.id+firstUser.id,name:data.name});
        inChat[firstUser.id] = {room:secondUser.id+firstUser.id,name:data.name};
        inChat[secondUser.id] = {room:secondUser.id+firstUser.id,name:secondUser.name};
    //مؤقتا شلناه
    //    GetUserFromQuere(secondUser.id);

        
        
     }

}



const adminCheckUsers = (socket)=>{
    if(admins[socket.id]){
        let admin =  admins[socket.id];

    if(queueToAdmin.length>0){
        admin.status='busy';
        connectTwoUsers(socket,queueToAdmin[0],admin);
        GetUserFromAdminQuere(queueToAdmin[0].id)
    }else{
        admin.status="free";
    }

}else{
    // console.log('no');
}
}




// ROUTES


app.get('/',(req,res)=>{

    res.sendFile(__dirname + '/index-support.html');
// if(checkIfBanned(req.connection.remoteAddress)){
    

// }else{
//     res.sendFile(__dirname + '/not-allowed.html');

// }

});

app.get('/not-allowed',(req,res)=>{

     res.sendFile(__dirname + '/not-allowed.html');
 

});


app.get('/terms',(req,res)=>{
   res.sendFile(__dirname + '/terms.html');

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
            req.session.username=req.body.username;
        }
       if(req.body.username=="19256341_moderator"){
            req.session.username=req.body.username;
       }
       res.redirect("/dashboard");

})


