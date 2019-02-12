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
    peer: null,
    isPeerInitialized: false,
    call: null,
    isAdminConnected: false,
    isPlaying: false,
    updateAdminTimer: null,
    startCtxBtn: null,
    userPlayer: null,
    ctx: null,
    sampleRate: null,
    micGain: null,
    playerGain: null,
    micStream: null,
    micToAdminGain: null,
    playerToAdminGain: null,
    playerStream: null,
    micStreamToOutput: null,
    clonedMicStream: null,
    clonedPlayerStream: null,
    micGainValue: 0.5,
    playerGainValue: 0.8,
    analyser: null,
    dataArray: null,
    pitchArr: [],
    detectPitch: pitchFinder.YIN(),
    isOscActive: true,
    isOscPlaying: false,
    oscGainValue: 0.001
}

export class UserContextStore extends Component{
    state = INITIAL_STATE
    setPeerConnection = async () => {
        await this.setState({peer: new Peer(this.context.room.username, peerConfig ), isPeerInitialized: true });
    }
    initUserPlayback = async userPlayerElement => {
        await this.setState({
            ctx: new(window.AudioContext || window.webkitAudioContext)(),
        })
        await this.setState({
            sampleRate: this.state.ctx.sampleRate,
            analyser: this.state.ctx.createAnalyser(),
            userPlayer: userPlayerElement
        })
        // SETUP ANALYSER
        // Capture Stream from audio player
        if(this.isChromeBrowser()){
            this.setState({playerStream: this.state.userPlayer.captureStream()})
            console.log("Chrome Capture");
        } else {
            this.setState({playerStream: this.state.userPlayer.mozCaptureStream()})
            console.log("FireFox Capture");
        }
        await this.setState({playerGain: this.state.ctx.createGain()})
        this.state.playerGain.gain.value = this.state.playerGainValue;
        let playerStreamToOutput = this.state.ctx.createMediaStreamSource(this.state.playerStream);
        let filter = this.state.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 250;
        playerStreamToOutput.connect(filter);
        filter.connect(this.state.analyser);
        this.state.analyser.connect(this.state.playerGain);
        this.state.playerGain.connect(this.state.ctx.destination);
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
            this.setState({
                micStream: stream, 
                micGain: this.state.ctx.createGain()
            })
            this.state.micGain.gain.value = this.state.micGainValue;
            this.setState({micStreamToOutput: this.state.ctx.createMediaStreamSource(this.state.micStream)})
            this.state.micStreamToOutput.connect(this.state.micGain);
            this.state.micGain.connect(this.state.ctx.destination);
            console.log("Finished Mic Setup");
            this.setupConnection();
        })
        .catch((err) => console.error(err));
    }
    setupConnection = () =>{
        let conn = this.state.peer.connect('admin', {serialization: "json"});
        if(!conn){
            if(window.confirm("Unable to connect reload page?")){
                window.location.reload();
            }
        }
        conn.on('open', () => {
            this.setState({isAdminConnected: true})
            conn.send({cmd: "user online"});
        });
        conn.on('close', () => {
            this.setState({isAdminConnected: false})
            console.log("Admin Disconnected")
            clearInterval(this.state.updateAdminTimer);
            this.setState({updateAdminTimer: null})
            // if(!this.state.isAdminConnected){
            //     reconnect();
            // }            
        });
        conn.on('data', (data) => {
            const updateAdminUi = () => {
                conn.send({
                    cmd: "update" ,
                    micGain: this.state.micGainValue, 
                    playerGain: this.state.playerGainValue, 
                    isPlaying: this.state.isPlaying, 
                    playerTime: this.state.userPlayer.currentTime, 
                    isAdminConnected: this.state.isAdminConnected 
                });
            }
            if(data.cmd === "admin connect"){
                console.log("Admin Connected");
                this.setState({updateAdminTimer: setInterval(() => {
                    updateAdminUi()
                }, 1000)})
            }
            if(data.cmd === "mic gain"){
                this.setState({micGainValue: data.value})
                this.state.micGain.gain.setValueAtTime(data.value, this.state.ctx.currentTime);
                this.state.micToAdminGain.gain.setValueAtTime(data.value, this.state.ctx.currentTime);
            }
            if(data.cmd === "player gain"){
                this.setState({playerGainValue: data.value})
                this.state.playerGain.gain.setValueAtTime(data.value, this.state.ctx.currentTime);
                this.state.playerToAdminGain.gain.setValueAtTime(data.value, this.state.ctx.currentTime);
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
                this.state.userPlayer.play();
                this.setState({isPlaying: true})
                this.pitchDetector();
            }
            if(data.cmd === "player pause"){
                this.setState({isPlaying: false});
                this.state.userPlayer.pause();
            }
            if(data.cmd === "player stop"){
                this.setState({isPlaying: false})
                this.state.userPlayer.currentTime = 0;
                this.state.userPlayer.pause();
            }
            if(data.cmd === "rewind"){
                let newTransportPosition = this.state.userPlayer.currentTime - 30 > 0 ? this.state.userPlayer.currentTime - 30 : 0;
                this.state.userPlayer.currentTime = newTransportPosition;
            }
            if(data.cmd === "fforward"){
                let maxDuration = this.state.userPlayer.duration;
                let newTransportPosition = this.state.userPlayer.currentTime + 30 < maxDuration ? this.state.userPlayer.currentTime + 30 : maxDuration;
                this.state.userPlayer.currentTime = newTransportPosition;
            }
        });
        this.state.peer.on('call', (call) => {
            console.log("Got call from admin");
            this.createStreamToAdmin(call)
            this.setState({isAdminConnected: true})
        });
    }
    createStreamToAdmin = async (call) => {
        await this.setState({clonedMicStream: this.state.micStream.clone(), clonedPlayerStream: this.state.playerStream.clone()})
        let streamToAdmin = this.state.ctx.createMediaStreamDestination();
        let micStreamToAdmin = this.state.ctx.createMediaStreamSource(this.state.clonedMicStream);
        let playerStreamToAdmin = this.state.ctx.createMediaStreamSource(this.state.clonedPlayerStream);
        // Stream volume mix controls
        await this.setState({micToAdminGain: this.state.ctx.createGain(), playerToAdminGain: this.state.ctx.createGain()})
        // Init mix controls gain
        this.state.micToAdminGain.gain.setValueAtTime(this.state.micGainValue, this.state.ctx.currentTime);
        this.state.playerToAdminGain.gain.setValueAtTime(this.state.playerGainValue, this.state.ctx.currentTime);
        micStreamToAdmin.connect(this.state.micToAdminGain);
        playerStreamToAdmin.connect(this.state.playerToAdminGain)
        this.state.micToAdminGain.connect(streamToAdmin);
        this.state.playerToAdminGain.connect(streamToAdmin);
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
            let adminMicPlayer = document.getElementById('adminMicPlayer');
            adminMicPlayer.srcObject= adminStream;
            adminMicPlayer.play()
        });
    }
    pitchDetector = () => {
        console.log("Start Pitch Detector")
        if(!this.state.isPlaying){
            return;
        }
        // Populate the dataArray from the analyser method
        let dataArray = new Uint8Array(this.state.analyser.fftSize)
        this.state.analyser.getByteTimeDomainData(dataArray);
        // Detect pitch and push to array;
        let pitch = this.state.detectPitch(dataArray, { sampleRate: 48000});
        console.log(this.state.pitchArr, pitch);
        this.setState({pitchArr: [...this.state.pitchArr, pitch]})
        if(this.state.pitchArr.length > 2){
            let newPitchArr = this.state.pitchArr;
            newPitchArr.shift()
            this.setState({pitchArr: newPitchArr});
        }
        // Pervent overloading the oscillator
        if(this.state.isOscActive && !this.state.isOscPlaying && this.state.pitchArr[1] && this.state.pitchArr[1] !== this.state.pitchArr[0]){
            this.playOsc(this.state.pitchArr[1])
        }
        requestAnimationFrame(this.pitchDetector)
    }
    playOsc = pitch => {
        let osc = this.state.ctx.createOscillator();
        let oscGain = this.state.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch*100, this.state.ctx.currentTime);
        oscGain.gain.value = this.state.oscGainValue;
        osc.connect(oscGain);
        oscGain.connect(this.state.ctx.destination)
        this.setState({isOscPlaying: true})
        setTimeout(() => { this.setState({isOscPlaying: false})}, 1000);
        osc.start();
        oscGain.gain.setValueAtTime(0, this.state.ctx.currentTime + 0.8)
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
        if(this.state.ctx){
            this.state.ctx.close();
        }
        if(this.state.peer){
            this.state.peer.close();
        }
    }
    render(){
        return(
            <Context.Provider value={{
                ...this.state,
                setStartCtxBtn: this.setStartCtxBtn,
                initUserPlayback: this.initUserPlayback
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

UserContextStore.contextType = appContext;
export default Context;