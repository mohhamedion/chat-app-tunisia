
		 
 			
		 
			socket.on('signaling_message', function(data) {
				displaySignalMessage("Signal received: " + data.type);
				 console.log(rtcPeerConn);
				//Setup the RTC Peer Connection object
				if (!rtcPeerConn){
					startSignaling();
				}
					
					
				if (data.type != "user_here") {
					var message = JSON.parse(data.message);
					if (message.sdp) {
						rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function () {
							// if we received an offer, we need to answer
							if (rtcPeerConn.remoteDescription.type == 'offer') {
								rtcPeerConn.createAnswer(sendLocalDesc, logError);
							}
						}, logError);
					}
					else {
						rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
					}
				}
				
			});
		
			socket.on('files', function(data) {
				receivedFileName = data.filename;
				receivedFileSize = data.filesize;
				displaySignalMessage("websockets says the file on it's way is " + receivedFileName + " (" + receivedFileSize + ")");
				fileSending(0,name,receivedFileName);
				$("#fileProgress").attr('max',receivedFileSize);
				 
			});
			
			function startSignaling() {
				displaySignalMessage("starting signaling...");
				
				rtcPeerConn = new  RTCPeerConnection(configuration, null);
				dataChannel = rtcPeerConn.createDataChannel('textMessages', dataChannelOptions);
				
				dataChannel.onopen = dataChannelStateChanged;
				rtcPeerConn.ondatachannel = receiveDataChannel;
				
				// send any ice candidates to the other peer
				rtcPeerConn.onicecandidate = function (evt) {
					if (evt.candidate)
						socket.emit('signal',{"type":"ice candidate", "message": JSON.stringify({ 'candidate': evt.candidate }), "room":room});
					displaySignalMessage("completed that ice candidate...");
				};
				
				// let the 'negotiationneeded' event trigger offer generation
				rtcPeerConn.onnegotiationneeded = function () {
					displaySignalMessage("on negotiation called");
					rtcPeerConn.createOffer(sendLocalDesc, logError);
				}
				
 			 
			 
			  
			}
			
			function dataChannelStateChanged() {
				if (dataChannel.readyState === 'open') {

					setSendFileToClickble();

					displaySignalMessage("Data Channel open");
					dataChannel.onmessage = receiveDataChannelMessage;
				}
			}
			
			function receiveDataChannel(event) {
				displaySignalMessage("Receiving a data channel");
				dataChannel = event.channel;
				dataChannel.onmessage = receiveDataChannelMessage;
			}
			
			function receiveDataChannelMessage(event) {
				displaySignalMessage("Incoming Message");
				console.log(fileSize)
				displayMessage("From DataChannel: " );
				console.log(event.data)
				
				//This is where we process incoming files
				fileBuffer.push(event.data);
				fileSize += event.data.byteLength;
			
				console.log('before change '+receivedFileName);
				$("#fileProgress").val(fileSize);
			 
				//Provide link to downloadable file when complete
				console.log(fileSize+"  should be equal   "+ receivedFileSize);
				if (fileSize === receivedFileSize) {
					var received = new window.Blob(fileBuffer);
					fileBuffer = [];
					fileSize=0;
			 
					console.log("   OUT PUT MESSAGE " )
					console.log(received);

				   hisMessage(`<br><img style='width:250px' class='rounded img-thumbnail'  src='${URL.createObjectURL(received)}' />`,name);
				   $('#chat_component_p').scrollTop($('#chat_component_p')[0].scrollHeight);
				   $("#fileProgress").parent().parent().remove();

				}
				
			}
			
			function sendLocalDesc(desc) {
				rtcPeerConn.setLocalDescription(desc, function () {
					displaySignalMessage("sending local description");
					socket.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":room});
				}, logError);
			}
			
			function logError(error) {
				displaySignalMessage(error.name + ': ' + error.message);
			}
			
		 
			
 
		 
			function displaySignalMessage(message) {
 				console.log(message)
			}
			sendFile.addEventListener('change', function(ev){
				var file = sendFile.files[0];
				readURL(this);
				fileSending(1,null,file.name);
  				displaySignalMessage("sending file " + file.name + " (" + file.size + ") ...");
				socket.emit('files',{"filename":file.name, "filesize":file.size, "room":room});
				
				 $("#fileProgress").attr('max',file.size);
				 $("#fileProgress").max = file.size;
				 
				var chunkSize = 16384;
				var sliceFile = function(offset) {
					var reader = new window.FileReader();
					reader.onload = (function() {
						return function(e) {
							dataChannel.send(e.target.result);
							if (file.size > offset + e.target.result.byteLength) {
								window.setTimeout(sliceFile, 0, offset + chunkSize);
								$("#fileProgress").parent().parent().remove();
								}
							$(`#fileProgress`).val(offset + e.target.result.byteLength)   ;
 						};
					})(file);
					var slice = file.slice(offset, offset + chunkSize);
					reader.readAsArrayBuffer(slice);
				};
				sliceFile(0);		
			
			}, false);

			function displayMessage (msg){
				console.log(msg)
			}

