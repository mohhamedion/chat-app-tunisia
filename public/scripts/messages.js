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
'الله',
'نشيخك',
'واحد',
'نعملك' ,
'موقف' ,
'ساكس' ,
'ميبون',
'طحان',
'Owner',
'Sex',
'Nchaykhek',
'We7ed',
'Zabour',
'Mwagef',
'Rose' ,
'Pussy',
'Boobs',
'Tits',
'Ass',
'Miboun',
'Tahan',
'Ta7an',
'porn'
];
		socket.on("connected",()=>{
		//console.log("both are connected");
		$("#chat_component").html("");
			setSendMessageToClickble();
			$("#newUserSound")[0].play();
			$(".tryAgain").hide();

 			if(stranger_name=="Admin"||stranger_name=="Moderator"){
				$("#connection_message").html(" <b style='color:green'>You are now chatting with the owner of the website... Say Hi  to  "+stranger_name+"</b>");

			} else{
				$("#connection_message").html("you are chatting now with a stranger, say hi to <b>"+stranger_name+"</b>");

			}
		 
			if(room.substring(0,20)==socket.id){
	 				socket.emit('signal',{"type":"user_here", "message":"Are you ready for a call?", "room":room});
				//	console.log('am calling the other peer')
				 //    console.log(room);
			 }
			 
		

			$("#messageContent").keypress(function(event){
				
			var keycode = (event.keyCode ? event.keyCode : event.which);
				if(keycode == '13'){
					if(room.length>0){
						if($("#messageContent").val()!==""){
							socket.emit("messageToServer",{message:$("#messageContent").val(),room:room,id:socket.id});
						$("#messageContent").val('');
							keyUp=true;
						}
					}
				} 

			});


			$("#messageContent").on("input",function(){

				 if(keyUp){
				 console.log('typing')

					socket.emit("typing",{room:room});
					keyUp=false;
				 }
			})

		 
			$('#messageContent').keyup(function(){
			
				if(!keyUp){
					if($(this).val().length==0){
						console.log("stop typing")
						socket.emit("stopTyping",{room:room});
						keyUp=true;
					}
				}
				

		 });
		 

			$("#sendMessage").click(function(){
				if($("#messageContent").val()!==""){
					socket.emit("messageToServer",{message:$("#messageContent").val(),room:room,id:socket.id});
					$("#messageContent").val('');
					keyUp=true;
			
				}
			
			})
		
		})
	

	
		


		socket.on("messageToClient",(data)=>{
			if(room.length>0){
				if(data.id==socket.id){
					myMessage(data.message);
				}else{
					if(stranger_name.length>0){
						hisMessage(data.message,stranger_name);
					}
					$("#userTyping").hide();
				}
			$('#chat_component_p').scrollTop($('#chat_component_p')[0].scrollHeight);
 
			}

		})


		socket.on("getOut",(data)=>{
			$(".tryAgain").show();
			$("#userTyping").hide();
			setSendFileToDisable();
			setSendMessageToDisable();
		 
			disconnectingWebRTC()
			fileSize=0;

			fileBuffer = [];

 			stranger_name='';
			room='';
			$('#chat_component_p').scrollTop($('#chat_component_p')[0].scrollHeight);
			$("html, body").animate({ scrollTop: $(document).height()-$(window).height() });

		})

	 

		$(".startAgain").click(function(){
 		 
				$("#connection_message").html("looking for someone to chat with");
				$(".tryAgain").hide();
				$("#chat_component").html('');
 				// rtcPeerConn.close();
				// dataChannel.close();
				// rtcPeerConn=null;
				disconnectingWebRTC();
				fileSize=0;
			 
				fileBuffer = [];
				socket.emit("queue",{name:name,id:socket.id});
			 
		

		})





		socket.on("typing",()=>{
			
			$("#userTyping").show();
			// $("#userTyping").delay(3000).hide(0);
			$('#chat_component_p').scrollTop($('#chat_component_p')[0].scrollHeight);

 			 
		})

		socket.on("stopTyping",()=>{
			
			$("#userTyping").hide();
 			$('#chat_component_p').scrollTop($('#chat_component_p')[0].scrollHeight);

 			 
		})



		$(".next").click(function(){
			if(stranger_name!=null){
				var answer=confirm('are you sure you want to close this chat and start again?');
					if(answer){
							
						$("#connection_message").html("<em>looking for someone to chat with</em>");
										$(".tryAgain").hide();
										$("#chat_component").html('');
										$("#userTyping").hide();

							 
										stranger_name=null;
										disconnectingWebRTC();
 
										socket.emit("otherPeerDisconected");
										room='';
										socket.emit("queue",{name:name,id:socket.id});
										setSendMessageToDisable();
										setSendFileToDisable();
						}

			}else{
				$("#connection_message").html("<em>looking for someone to chat with</em>");
										$(".tryAgain").hide();
										$("#chat_component").html('');
										$("#userTyping").hide();

										//console.log('start again');
									
										disconnectingWebRTC();

									//	console.log(name);
										//console.log(socket.id);
										socket.emit("otherPeerDisconected");
										room='';
										socket.emit("queue",{name:name,id:socket.id});
										setSendMessageToDisable();
										setSendFileToDisable();
			}
		

		})




				function startChating(){
		

					name =  $("#myName").val();
 
					if(!preperingName(name)){
						return false;
					} 

					
					 $("#index_section").hide();
					 $(".StartChattingHide").hide();
					 $("html,body").css("height","92%")
					$("#chat_section").animate({width:'toggle'},500);

					socket.emit("queue",{name:name,id:socket.id});
			 

				
				}


				$("#myName").keypress(function(event){
				
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if(keycode == '13'){
					
					startChating();
					
				}
	
				});


 

 function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    
    reader.onload = function(e) {
 	  myMessage(`<br><img style='width:250px' class='rounded img-thumbnail'  src='${e.target.result}' />`);
    }
    
    reader.readAsDataURL(input.files[0]); // convert to base64 string
  }
}




function disconnectingWebRTC(){

try{
	rtcPeerConn.close();
	dataChannel.close();
	rtcPeerConn=null;
	dataChannel=null;
}catch(e){
 }

}