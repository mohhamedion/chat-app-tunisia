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


function fileSending(x,name=null){
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

function preperingName(name){
    	
    var x=0;
    var forbidden = ['a','d','m','i','n'];
    name = name.trim();
    if(name==""){
        alert('enter your name');
        return false;
    } 
    if(name.length>20){
        alert('name is to long');
        return false;

    }

    if(name.toLowerCase()=="admin"||name.toLowerCase()=="moderator"){
        alert('not allowed to take this name');
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
    if(x>=5){

        alert('you cant use that name')

        return false;
    }

    if(!filter(name,badwords)){
        alert('you cant use that name')
        return false;
    }
     



    

    return true;
}



function filter(name,badwords){
   for(let i=0;i<badwords.length;i++){
          let badword=badwords[i];
   
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


 
 