import React, {Component} from 'react';
import pitchFinder from 'pitchfinder';
import appContext from './appContext';
import {serverAPI} from '../api/api'
import PeerClient from 'peerjs';

const Context = React.createContext();
const Peer = window.Peer;

const peerConfig = {
    host: window.location.hostname, 
    port: '8080', 
    path: '/peerjs', 
    sdpSemantics: 'unified-plan',
    debug: 0,
}

const INITIAL_STATE = {
    isOnline: false,
    peer: null,
    isPeerInitialized: false,
    isAdminConnected: false,
    isPlaying: false,
    micStream: null,
    playerStream: null,
    micStreamToOutput: null,
    clonedMicStream: null,
    clonedPlayerStream: null,
    micGainValue: 0.5,
    playerGainValue: 0.8,
    isOscActive: true,
    isOscPlaying: false,
    oscGainValue: 0.001
}

export class UserContextStore extends Component{
    state = INITIAL_STATE
    constructor(props){
        super(props)
        this.ctx = null;
        this.micToAdminGain = null;
        this.playerToAdminGain = null;
        this.playerGain = null;
        this.micGain = null;
        this.userPlayer = null;
        this.analyser = null;
        this.sampleRate = null;
        this.pitchArr = [];
        this.detectPitch = pitchFinder.YIN();
        this.updateAdminTimer = null;
        this.adminMicPlayer = null;
    }
    setPeerConnection = async () => {
        await this.setState({peer: new Peer(this.context.room.username, peerConfig ), isPeerInitialized: true });
    }
    initUserPlayback = async userPlayerElement => {
        this.ctx = await new(window.AudioContext || window.webkitAudioContext)();
        this.userPlayer = userPlayerElement;
        this.analyser = this.ctx.createAnalyser();
        this.sampleRate = this.ctx.sampleRate;
        // Capture Stream from audio player
        if(this.isChromeBrowser()){
            this.setState({playerStream: this.userPlayer.captureStream()})
        } else {
            this.setState({playerStream: this.userPlayer.mozCaptureStream()})
        }
        this.playerGain = this.ctx.createGain()
        this.playerGain.gain.value = this.state.playerGainValue;
        let playerStreamToOutput = this.ctx.createMediaStreamSource(this.state.playerStream);
        let filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 250;
        playerStreamToOutput.connect(filter);
        filter.connect(this.analyser);
        this.analyser.connect(this.playerGain);
        this.playerGain.connect(this.ctx.destination);
        this.getUserMicStream()
    }
    isChromeBrowser = () => {
        if(navigator.userAgent.indexOf("Chrome") >= 0){
            console.log("Chrome")
            return true
        } else if(navigator.userAgent.indexOf("Firefox") >= 0){
            console.log("FireFox")
            return false
        }
    }
    getUserMicStream = async () => {
        let constraints = { video: false, audio: true };
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            this.micGain = this.ctx.createGain();
            this.setState({
                micStream: stream, 
            })
            this.micGain.gain.value = this.state.micGainValue;
            this.setState({micStreamToOutput: this.ctx.createMediaStreamSource(this.state.micStream)})
            this.state.micStreamToOutput.connect(this.micGain);
            this.micGain.connect(this.ctx.destination);
            console.log("Finished Mic Setup");
            this.setupConnection();
        })
        .catch((err) => console.error(err));
    }
    setupConnection = async () =>{
        let conn = await this.state.peer.connect('admin', {serialization: "json"});
        this.setState({isOnline: true})
        conn.on('open', () => {
            conn.send({cmd: "user online"});
        });
        conn.on('admin disconnect', () => {
            console.log("Admin disconnected");
        })
        conn.on('close', () => {
            this.setState({isOnline: false})
            console.log("Admin Disconnected")
            clearInterval(this.updateAdminTimer);
            this.updateAdminTimer = null;         
        });
        conn.on('data', (data) => {
            if(this.state.isAdminConnected){
                if(data.cmd === "admin connect"){
                    console.log("Admin Connected");
                }
                if(data.cmd === "mic gain"){
                    this.setState({micGainValue: data.value})
                    this.micGain.gain.setValueAtTime(data.value, this.ctx.currentTime);
                    this.micToAdminGain.gain.setValueAtTime(data.value, this.ctx.currentTime);
                }
                if(data.cmd === "player gain"){
                    this.setState({playerGainValue: data.value})
                    this.playerGain.gain.setValueAtTime(data.value, this.ctx.currentTime);
                    this.playerToAdminGain.gain.setValueAtTime(data.value, this.ctx.currentTime);
                }
                if(data.cmd === "osc state"){
                    if(data.value === false){
                        this.setState({isOscActive: false});
                    } else {
                        this.setState({isOscActive: true});
                    };
                }
                if(data.cmd === "osc gain"){
                    this.setState({oscGainValue: data.value})
                }
                if(data.cmd === "player start"){
                    this.userPlayer.play();
                    this.setState({isPlaying: true})
                    this.pitchDetector();
                }
                if(data.cmd === "player pause"){
                    this.setState({isPlaying: false});
                    this.userPlayer.pause();
                }
                if(data.cmd === "player stop"){
                    this.setState({isPlaying: false})
                    this.userPlayer.currentTime = 0;
                    this.userPlayer.pause();
                }
                if(data.cmd === "rewind"){
                    let newTransportPosition = this.userPlayer.currentTime - 30 > 0 ? this.userPlayer.currentTime - 30 : 0;
                    this.userPlayer.currentTime = newTransportPosition;
                }
                if(data.cmd === "fforward"){
                    let maxDuration = this.userPlayer.duration;
                    let newTransportPosition = this.userPlayer.currentTime + 30 < maxDuration ? this.userPlayer.currentTime + 30 : maxDuration;
                    this.userPlayer.currentTime = newTransportPosition;
                }
            }
            this.state.peer.on('call', (call) => {
                console.log("Got call from admin");
                
                this.createStreamToAdmin(call, conn)
                call.on('close', () => {
                    console.log("CALL ENDED");
                    clearInterval(this.updateAdminTimer);
                    if(this.adminMicPlayer){
                        this.adminMicPlayer.pause();
                        this.adminMicPlayer.currentTime = 0;
                    }
                    this.setState({isAdminConnected: false, updateAdminTimer: null, adminMicPlayer: null});
                })
                call.on('error', () => {
                    console.log("CALL ENDED ON ERROR");
                    this.setState({isAdminConnected: false})
                })
                this.setState({isAdminConnected: true})
                conn.send({cmd: 'user answered'})
            });
        });
        
    }
    createStreamToAdmin = async (call, conn) => {
        await this.setState({clonedMicStream: this.state.micStream.clone(), clonedPlayerStream: this.state.playerStream.clone()})
        let streamToAdmin = this.ctx.createMediaStreamDestination();
        let micStreamToAdmin = this.ctx.createMediaStreamSource(this.state.clonedMicStream);
        let playerStreamToAdmin = this.ctx.createMediaStreamSource(this.state.clonedPlayerStream);
        // Stream volume mix controls
        this.micToAdminGain = this.ctx.createGain() 
        this.playerToAdminGain = this.ctx.createGain()
        // Init mix controls gain
        this.micToAdminGain.gain.setValueAtTime(this.state.micGainValue, this.ctx.currentTime);
        this.playerToAdminGain.gain.setValueAtTime(this.state.playerGainValue, this.ctx.currentTime);
        micStreamToAdmin.connect(this.micToAdminGain);
        playerStreamToAdmin.connect(this.playerToAdminGain)
        this.micToAdminGain.connect(streamToAdmin);
        this.playerToAdminGain.connect(streamToAdmin);
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
            this.adminMicPlayer = document.getElementById('adminMicPlayer');
            this.adminMicPlayer.srcObject= adminStream;
            this.adminMicPlayer.play()
        });
        const updateAdminUi = () => {
            if(this.state.isAdminConnected){
                conn.send({
                    cmd: "update" ,
                    micGain: this.state.micGainValue, 
                    playerGain: this.state.playerGainValue, 
                    isPlaying: this.state.isPlaying, 
                    playerTime: this.userPlayer.currentTime, 
                    isAdminConnected: this.state.isAdminConnected,
                    isOnline: this.state.isOnline
                });
            }
        }
        this.updateAdminTimer = setInterval(() => {
            updateAdminUi()
        }, 1000);
    }
    pitchDetector = () => {
        if(!this.state.isPlaying){
            return;
        }
        // Populate the dataArray from the analyser method
        let dataArray = new Uint8Array(this.analyser.fftSize)
        this.analyser.getByteTimeDomainData(dataArray);
        // Detect pitch and push to array;
        let pitch = this.detectPitch(dataArray, { sampleRate: 48000});
        this.pitchArr = [...this.pitchArr, pitch]
        if(this.pitchArr.length > 2){
            let newPitchArr = this.pitchArr;
            newPitchArr.shift()
            this.pitchArr = newPitchArr;
        }
        // Pervent overloading the oscillator
        if(this.state.isOscActive && !this.state.isOscPlaying && this.pitchArr[1] && this.pitchArr[1] !== this.pitchArr[0]){
            this.playOsc(this.pitchArr[1])
        }
        requestAnimationFrame(this.pitchDetector)
    }
    playOsc = pitch => {
        let osc = this.ctx.createOscillator();
        let oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch*100, this.ctx.currentTime);
        oscGain.gain.value = this.state.oscGainValue;
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination)
        this.setState({isOscPlaying: true})
        setTimeout(() => { this.setState({isOscPlaying: false})}, 1000);
        osc.start();
        oscGain.gain.setValueAtTime(0, this.ctx.currentTime + 0.8)
        setTimeout(() => {
            osc.stop();
        }, 1000)
    }
    componentDidMount() {
        this.setPeerConnection()
        .then(() => {
            console.log("Peer initialized")
        })
        .catch(err => {console.log(err)})
    }
    componentWillUnmount(){
        if(this.ctx){
            this.ctx.close();
        }
        if(this.state.peer){
            this.state.peer.close();
        }
    }
    render(){
        return(
            <Context.Provider value={{
                ...this.state,
                initUserPlayback: this.initUserPlayback
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

UserContextStore.contextType = appContext;
export default Context;