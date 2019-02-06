// PEER CONNECTION

let reconnectAttempts = 0;
let ctx;
let adminMicGain;
let outputToUser;
const startCtx = document.getElementById('startctx');
const disconnectButton = document.getElementById('disconnect');
const adminPlayer = document.querySelector('audio');
const talkBackButton = document.getElementById('talkback');
const userMicGainSlider = document.querySelector('#micGain');
const userPlayerGainSlider = document.querySelector('#playerGain');
const startUserPlayerBtn = document.getElementById('startUserPlayer');
const pauseUserPlayerBtn = document.getElementById('pauseUserPlayer');
const stopUserPlayerBtn = document.getElementById('stopUserPlayer');
const timeDisplay = document.getElementById('timeDisplay');
const rewind = document.getElementById('rewind');
const fforward = document.getElementById('fforward');
const oscActive = document.getElementById('oscActive');
const oscGain = document.getElementById('oscGain');
const host = window.location.hostname;


const updateRoomsList = () => {
    const roomsList = document.getElementById('roomList');
    roomsList.innerHTML = "";
    for(room in peer.connections){
        roomsList.innerHTML += `<option>${room}</option>`
    }
}
let peer = new Peer('admin', {
    host: host, 
    port: '8080', 
    path: '/peerjs', 
    sdpSemantics: 'unified-plan',
    debug: 0,
});
peer.on('disconnected', () => {
    location.reload();
    // let reconnectInterval = setInterval(() => {
    //     if(reconnectAttempts <= 3){
    //         peer.reconnect();
    //         reconnectAttempts += 1;
    //     } else {
    //         console.log("Unable to connect...");
    //         clearInterval(reconnectInterval);
    //     }
    // }, 3000);
})
peer.on('connection', (conn) => {
    conn.on('open', () => {
        startUserPlayerBtn.removeAttribute('disabled');
        conn.send({cmd: "admin connect"});
        console.log('got user online')
        startCtx.removeAttribute('disabled');
        updateRoomsList()
        conn.on('data', (data) => {
            if(data.cmd === "update"){
                // console.log(data)
                // Mic & Player Gain Status
                userMicGainSlider.value = data.micGain * 100;
                userPlayerGainSlider.value = data.playerGain * 100;
                // Playin status
                // if(data.isPlaying){
                //     startUserPlayerBtn.setAttribute('disabled', true);
                //     stopUserPlayerBtn.removeAttribute('disabled');
                //     pauseUserPlayerBtn.removeAttribute('disabled');
                // } else {
                //     startUserPlayerBtn.removeAttribute('disabled');
                //     stopUserPlayerBtn.setAttribute('disabled', true);
                //     pauseUserPlayerBtn.setAttribute('disabled', true);
                // }
            }
            if(data.cmd === "player status"){
                let min = Math.floor(data.value / 60)
                let sec = Math.round(data.value - min * 60);
                let timeString = `${min}:${sec}`
                timeDisplay.innerHTML = timeString
            }
        })
        oscActive.addEventListener('change', (e) => {
            if(e.target.value === "on"){
                oscActive.setAttribute('value', "off");
            } else {
                oscActive.setAttribute('value', "on");
            }
            conn.send({cmd: "osc state", value: e.target.value});
        })
        oscGain.addEventListener('change', (e) => {
            conn.send({cmd: "osc gain", value: e.target.value / 10000 });
        })
        userMicGainSlider.addEventListener('change', (e) => {
            conn.send({cmd: "mic gain", value: e.target.value / 100 });
        });
        userPlayerGainSlider.addEventListener('change', (e) => {
            conn.send({cmd: "player gain", value: e.target.value / 100 });
        });
        talkBackButton.addEventListener('mousedown', () => {
            adminMicGain.gain.value = 0.7;
            console.log(adminMicGain.gain.value)
            conn.send("Talkback open")
        });
        talkBackButton.addEventListener('mouseup', () => {
            adminMicGain.gain.value = 0;
            console.log(adminMicGain.gain.value)
            conn.send("Talkback closed")
        });
        
        startUserPlayerBtn.addEventListener('click', () => {
            conn.send({cmd: "player start"})
            startUserPlayerBtn.setAttribute('disabled', true);
            stopUserPlayerBtn.removeAttribute('disabled');
            pauseUserPlayerBtn.removeAttribute('disabled');
            rewind.removeAttribute('disabled');
            fforward.removeAttribute('disabled');
        });
        pauseUserPlayerBtn.addEventListener('click', () => {
            conn.send({cmd: "player pause"});
            pauseUserPlayerBtn.setAttribute('disabled', true);
            startUserPlayerBtn.removeAttribute('disabled');
        });
        stopUserPlayerBtn.addEventListener('click', () => {
            conn.send({cmd: "player stop"});
            stopUserPlayerBtn.setAttribute('disabled', true);
            pauseUserPlayerBtn.setAttribute('disabled', true);
            startUserPlayerBtn.removeAttribute('disabled');
        });
        rewind.addEventListener('click', () => {
            conn.send({cmd: "rewind"});
        });
        fforward.addEventListener('click', () => {
            conn.send({cmd: "fforward"});
        })
    });
    
})
const disableTransportButtons = () => {
    startUserPlayerBtn.setAttribute('disabled', true);
    stopUserPlayerBtn.setAttribute('disabled', true);
    rewind.setAttribute('diabled', true);
    fforward.setAttribute('diabled', true);
}
startCtx.addEventListener('click', () => {
    startCtx.setAttribute('disabled', true);
    disconnectButton.removeAttribute('disabled');
    setupAdminMic();
});



const setupAdminMic = async () => {
    ctx = await new AudioContext();
    navigator.mediaDevices.getUserMedia({audio: true})
        .then((micStream) => {
        outputToUser = ctx.createMediaStreamDestination();
        let micSource = ctx.createMediaStreamSource(micStream);
        adminMicGain = ctx.createGain();
        adminMicGain.gain.value = 0;
        micSource.connect(adminMicGain);
        adminMicGain.connect(outputToUser);
        callToUser()
    })
    .catch(err => console.error(err))
}

const callToUser = () => {
    let call = peer.call('user', outputToUser.stream);
    disconnectButton.addEventListener('click', () => {
        startCtx.removeAttribute('disabled');
        disconnectButton.setAttribute('disabled', true);

        // ctx.close();
        ctx = null;
        disableTransportButtons();
        call.close();
    });
    call.on('stream', stream => {
        console.log("Got Stream...")
        adminPlayer.srcObject = stream;
        adminPlayer.play();
    })
    call.on('error', (err) => {
        console.log(err);
    })
}

