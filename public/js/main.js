const socket = io("/");
const videoGrid = document.getElementById("videoGrid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer();

const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "5000",
});

const peers = {};
let fileContents;
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    socket.on("user-connected", (userName, userId) => {
      connectToNewUser(userId, stream);
      alert(`${userName} connected`, userId);
    });

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    let text = $("input");

    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message, userName, userId) => {
      $("ul").append(`<li >
								<span class="messageHeader">
									<span>
										From 
										<span class="messageSender">${userName}</span> 
										to 
										<span class="messageReceiver">Everyone:</span>
									</span>

									${new Date().toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
								</span>

								<span class="message">${message}</span>
							
							</li>`);
      scrollToBottom();
    });

    socket.on("fileUploaded", (fileContent, fileName, userName, userId) => {
      this.fileContents = fileContent;
      $("ul").append(`<li>
				<button onclick="download()">
				${fileName}
				</button>
			</li>`);
      scrollToBottom();
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, USER_NAME, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = $(".mainChatWindow");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`;
  document.querySelector(".mainMuteButton").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`;
  document.querySelector(".mainMuteButton").innerHTML = html;
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`;
  document.querySelector(".mainVideoButton").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`;
  document.querySelector(".mainVideoButton").innerHTML = html;
};



const uploadFile = () => {
	const file = document.getElementById('files').files[0];

	const reader = new FileReader();
    reader.onload = (fileReaderEvent) => {
			socket.emit('file', fileReaderEvent.target.result, file.name);
    };
    reader.readAsText(file);
}

const downloadFile = (blob, fileName) => {
	const link = document.createElement('a');
	if (link.download === undefined) {
		return;
	}

	const url = URL.createObjectURL(blob);
	link.setAttribute('href', url);
	link.setAttribute('download', fileName);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

const download = () => {
	const blob = new Blob([this.fileContents], {type: 'text/plain;charset=utf-8;'});
	downloadFile(blob, 'test2.txt');
	
}
