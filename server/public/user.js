// PEER CONNECTION
const roomName = document.getElementById('room-title').innerHTML;
const host = window.location.hostname;

const peer = new Peer(roomName, {
    host: host, 
    port: '8080', 
    path: '/peerjs', 
    sdpSemantics: 'unified-plan',
    debug: 0,
});

let reconnectAttempts = 0;
let call = null;
let isAdminConnected = false;
let isPlaying = false;
let updateAdminTimer;
// DOM Elements
const startCtxBtn = document.getElementById('startctx');
const userPlayer = document.querySelector('audio');

// AudioContext Setup
let ctx;
let sampleRate;
let micGain;
let playerGain;
let micStream;

let micToAdminGain;
let playerToAdminGain;
// Streams Variables
let playerStream;
let micStreamToOutput;
let clonedMicStream;
let clonedPlayerStream;

let micGainValue = 0.5;
let playerGainValue = 0.7;
let analyser;
let dataArray;
let pitchArr = [];

// Load Pitchfinder
let PitchFinder = window.PitchFinder
let detectPitch = PitchFinder.YIN();
let isOscActive = true;
let isOscPlaying = false;
let oscGainValue = 0.001;

const playOsc = pitch => {
    let osc = ctx.createOscillator();
    let oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch*100, ctx.currentTime);
    oscGain.gain.value = oscGainValue;
    osc.connect(oscGain);
    oscGain.connect(ctx.destination)
    isOscPlaying = true;
    setTimeout(() => { isOscPlaying = false}, 1000);
    osc.start();
    oscGain.gain.setValueAtTime(0, ctx.currentTime + 0.8)
    setTimeout(() => {
        osc.stop();
    }, 1000)
}

const pitchDetector = () => {
        if(!isPlaying){
            return;
        }
        // Populate the dataArray from the analyser method
        let dataArray = new Uint8Array(analyser.fftSize)
        analyser.getByteTimeDomainData(dataArray);
        // Detect pitch and push to array;
        let pitch = detectPitch(dataArray, { sampleRate: 48000});
        pitchArr.push(pitch);
        if(pitchArr.length > 2){
            pitchArr.shift()
        }
        // Pervent overloading the oscillator
        if(isOscActive && !isOscPlaying && pitchArr[1] && pitchArr[1] !== pitchArr[0]){
            playOsc(pitchArr[1])
        }
        requestAnimationFrame(pitchDetector)
}

peer.on('disconnected', () => {
    console.log("Trying to reconnect to server");
    reconnect()
})

if(document.readyState === "complete"){
    console.log("Ready")
    // Start Audio Context after document is loaded
    startCtxBtn.addEventListener('click', () => {
        startCtxBtn.setAttribute('disabled', true);
        startCtxBtn.style.display = "none";
        initUserPlayback()
    });
}



// Get Stream from audio player
const initUserPlayback = () => {
    ctx = new(window.AudioContext || window.webkitAudioContext)();
    // SETUP ANALYSER
    sampleRate = ctx.sampleRate;
    analyser = ctx.createAnalyser();
    // Capture Stream from audio player
    if(isChromeBrowser()){
        playerStream = userPlayer.captureStream();
        console.log("Chrome Capture");
    } else {
        playerStream = userPlayer.mozCaptureStream();
        console.log("FireFox Capture");
    }
    playerGain = ctx.createGain()
    playerGain.gain.value = playerGainValue;
    let playerStreamToOutput = ctx.createMediaStreamSource(playerStream);
    let filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 250;
    playerStreamToOutput.connect(filter);
    filter.connect(analyser);
    analyser.connect(playerGain);
    playerGain.connect(ctx.destination);
    getUserMicStream()
}

// Get stream from user Microphone
let getUserMicStream = () => {
    let constraints = { video: false, audio: true };
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        micStream = stream;
        micGain = ctx.createGain()
        micGain.gain.value = micGainValue;
        micStreamToOutput = ctx.createMediaStreamSource(micStream);
        micStreamToOutput.connect(micGain);
        micGain.connect(ctx.destination);
        setupConnection();
    })
    .catch((err) => console.error(err));
}
let isChromeBrowser = () => {
    if(navigator.userAgent.indexOf("Chrome") >= 0){
        console.log("Chrome")
        return true
    } else if(navigator.userAgent.indexOf("Firefox") >= 0){
        console.log("FireFox")
        return false
    }
}
let reconnect = () => {
    ctx.close();
    // ctx = null;
    setupConnection();
    reconnectAttempts += 1;
    console.log(reconnectAttempts);
}
// Setup peer 2 peer connection listen on incoming data;
const setupConnection = () =>{
    console.log(isAdminConnected);
    let conn = peer.connect('admin', {serialization: "json"});
    if(!conn){
        console.log(peer.connections);
        if(confirm("Unable to connect reload page?")){
            location.reload();
        }
    }
    conn.on('open', () => {
        isAdminConnected = true;
        conn.send({cmd: "user online"});
    });
    conn.on('close', () => {
        isAdminConnected = false;
        console.log("Admin Disconnected")
        clearInterval(updateAdminTimer);
        if(!isAdminConnected){
            reconnect();
        }            
    });
    conn.on('data', (data) => {
        const updateAdminUi = () => {
            conn.send({cmd: "update" ,micGain: micGainValue, playerGain: playerGainValue, isPlaying});
        }
        if(data.cmd === "admin connect"){
            console.log("Admin Connected");
            updateAdminTimer = setInterval(() => {
                updateAdminUi()
            }, 1000);
        }
        if(data.cmd === "mic gain"){
            micGainValue = data.value;
            micGain.gain.setValueAtTime(data.value, ctx.currentTime);
            micToAdminGain.gain.setValueAtTime(data.value, ctx.currentTime);
        }
        if(data.cmd === "player gain"){
            playerGainValue = data.value;
            playerGain.gain.setValueAtTime(data.value, ctx.currentTime);
            playerToAdminGain.gain.setValueAtTime(data.value, ctx.currentTime);
        }
        if(data.cmd === "osc state"){
            if(data.value === "off"){
                isOscActive = false;
            } else {
                isOscActive = true;
            };
        }
        if(data.cmd === "osc gain"){
            oscGainValue = data.value;
        }
        if(data.cmd === "player start"){
            userPlayer.play();
            isPlaying = true;
            pitchDetector();
        }
        if(data.cmd === "player pause"){
            isPlaying = false;
            userPlayer.pause();
        }
        if(data.cmd === "player stop"){
            isPlaying = false;
            userPlayer.currentTime = 0;
            userPlayer.pause();
        }
        if(data.cmd === "rewind"){
            let newTransportPosition = userPlayer.currentTime - 30 > 0 ? userPlayer.currentTime - 30 : 0;
            userPlayer.currentTime = newTransportPosition;
        }
        if(data.cmd === "fforward"){
            let maxDuration = userPlayer.duration;
            let newTransportPosition = userPlayer.currentTime + 30 < maxDuration ? userPlayer.currentTime + 30 : maxDuration;
            userPlayer.currentTime = newTransportPosition;
        }
    });
    peer.on('call', (call) => {
        console.log("Got call from admin");
        createStreamToAdmin(call)
        isAdminConnected = true;
    });
}

// 1. Clone active AUDIO & MIC Streams
// 2. Create Audio Context sources form cloned streams.
// 3. Create NEW Audio Context destination & connect cloned streams;
// 4 .Peer calls admin with newly created Audio Context destination.
let createStreamToAdmin = async (call) => {
    clonedMicStream = micStream.clone();
    clonedPlayerStream = playerStream.clone();
    let streamToAdmin = ctx.createMediaStreamDestination();
    let micStreamToAdmin = ctx.createMediaStreamSource(clonedMicStream);
    let playerStreamToAdmin = ctx.createMediaStreamSource(clonedPlayerStream);
    // Stream volume mix controls
    micToAdminGain = ctx.createGain();
    playerToAdminGain = ctx.createGain();
    // Init mix controls gain
    micToAdminGain.gain.setValueAtTime(micGainValue, ctx.currentTime);
    playerToAdminGain.gain.setValueAtTime(playerGainValue, ctx.currentTime);
    micStreamToAdmin.connect(micToAdminGain);
    playerStreamToAdmin.connect(playerToAdminGain)
    micToAdminGain.connect(streamToAdmin);
    playerToAdminGain.connect(streamToAdmin);
    let options = {
        'constraints': {
            'mandatory': {
                'OfferToReceiveAudio': true,
                'OfferToReceiveVideo': false
            }
        }
    }
    call.answer(streamToAdmin.stream)
    call.on('stream', (adminStream) => {
        console.log("Got stream from admin...", adminStream);
        let adminMicPlayer = document.getElementById('adminMicPlayer');
        adminMicPlayer.srcObject= adminStream;
        adminMicPlayer.play()
        // let adminTBSource = ctx.createMediaStreamSource(adminStream);
        // adminStream.connect(ctx.destination);
    });
}






