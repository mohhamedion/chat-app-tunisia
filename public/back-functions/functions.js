


// FUNCTIONS

const  checkIfBanned=(ip)=>{
    let status=true;
         for (let i = 0; i < bannedIP.length; i++) {
            const  e = bannedIP[i];
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

const  disconnectUserFromChat = (socket)=>{
 
let ChatRoom;
    try{
          ChatRoom=inChat[socket.id].room;
    }catch(e){
 }
  delete inChat[socket.id];
  
  
      
        io.of('/').in(ChatRoom).clients(function(error, clients) {
           if (clients.length > 0) {
            //    console.log('clients in the room: \n');
            //    console.log(clients);
                clients.forEach(function (socket_id) {
                    // console.log(socket_id+" user is leaving the chat");
                    if(socket.id!==socket_id){
                        delete inChat[socket_id];
                    }
       
                   io.sockets.sockets[socket_id].leave(ChatRoom);
                //    console.log("[disconnectUserFromChat] InCHAT  ")
                //    console.log(inChat);
       
               });
           }
       });
      
         io.to(ChatRoom).emit("getOut");

          GetUserFromQuere(socket.id);
          GetUserFromAdminQuere(socket.id);
  
}



const   GetUserFromQuere=(SocketId)=>{
    
    queue.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queue.splice(i,1);
             
            // console.log("the queue now is: 😍")
            // console.log(queue);
        }
    })
}



const   GetUserFromAdminQuere=(SocketId)=>{
    queueToAdmin.forEach((Element,i) =>{
        if(Element.id==SocketId){
            queueToAdmin.splice(i,1);
         
       
        }
    })
}








const  preperingName =(name)=>{
    console.log("HERE IS SCRIPT");
    let forbidden = ['a','d','m','i','n'];
    let x=0;
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
        const  element = name.charAt(i).toLowerCase();
         
        
        for (let y = 0; y < forbidden.length; y++) {
            const  forbiddenElement = forbidden[y];
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

        for (let i = 0; i < badwords.length; i++) {
            if(name==badwords[i]){
            //    console.log('you cant use that name');
               return false;
             }
       }

       return true;
}


const  escapeHTML =(msg) =>{
    try{
        return msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    }catch(e){
            console.log(e)
    }
 }

 const  connectTwoUsers=(firstUser,secondUser,data)=>{


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



const  adminCheckUsers = (socket)=>{
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

module.exports = {checkIfBanned}