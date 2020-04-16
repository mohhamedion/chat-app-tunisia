function myMessage(msg){
    $("#chat_component").append("<div><span class=''> <span style='color: red'>you</span>: "+msg+"</span></div>");

}

function hisMessage(msg,name){
    $("#newMessageSound")[0].pause();
    $("#newMessageSound")[0].play();
     
    if(name.toLowerCase()=='admin'||name.toLowerCase()=='moderator'){
 
        $("#chat_component").append("<div> <span class=''  style='color:green'> <span style='color: green'><b>"+name+"</span></b>: "+msg+"</span></div>");

    }else{
        $("#chat_component").append("<div> <span class=''  > <span style='color: blue'>"+name+"</span>: "+msg+"</span></div>");

    }
    

}


// function userDisconnect(){
// 	$("#chat_component").append("<div id='' style='display: none;' class='tryAgain'> <p><em>This stranger has disconected</em></p> <button   class='btn primary startAgain'> Start Again </button> </div>");
// }


function fileSending(x,name=null,id){
$("#fileProgress").parent().parent().remove();
    if(x==1){
        myMessage(`<div><progress id='fileProgress' value='1' max='100'></progress><a id='receivedFileLink'></a></div>`);
    }else{
        hisMessage(`<div><progress id='fileProgress' value='1' max='100'></progress><a id='receivedFileLink'></a></div>`,name);
    }
}

function	setSendFileToClickble(){

                
    $("#fileUpload").attr('disabled',false);
}

function	setSendMessageToClickble(){
     
             $("#sendMessage").attr('disabled',false);
             $("#messageContent").attr('readonly',false);
             

}

function	setSendFileToDisable(){

                
$("#fileUpload").attr('disabled',true);
}

function	setSendMessageToDisable(){
 
         $("#sendMessage").attr('disabled',true);
         $("#messageContent").attr('readonly',true);
         

}
