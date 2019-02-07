import React from 'react';
import {Input, Button, Label, Checkbox, Segment} from 'semantic-ui-react';
import {Slider} from 'react-semantic-ui-range';
import adminContext from '../../contexts/adminContext';

let ctx;
let adminMicGain;
let outputToUser;
let startCtx;
let disconnectButton;
let adminPlayer;
let talkBackButton;
let userMicGainSlider;
let userPlayerGainSlider;
let startUserPlayerBtn;
let pauseUserPlayerBtn;
let stopUserPlayerBtn;
let timeDisplay;
let rewind 
let fforward;
let oscActive;
let oscGain;

class RoomControls extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
    }
    renderRoomMixControls = () => {
        return(
            <Segment>
                <h4>Mic Volume</h4>
                <input
                id="micGain"
                min={1}
                max={100}
                name='micGain'
                step={1}
                type='range'
                defaultValue={50}
                />
                <h4>Sound Volume</h4>
                <input 
                id="playerGain"
                min={1}
                max={100}
                name='playerGain'
                step={1}
                type='range'
                defaultValue={70}
                />
            </Segment>
        )
    }
    renderOscControls = () => {
        return(
            <Segment>
                <h4>OSC</h4>
                <input type="checkbox" id="oscActive" checked />
                <input 
                id="oscGain"
                min={1}
                max={100}
                name='oscGain'
                step={1}
                type='range'
                defaultValue={70}
                />
            </Segment>
        )
    }
    renderPlayerControls = () => {
        return (
        <Segment>
            <h4>Connection</h4>
            <Button.Group>
                <Button icon='assistive listening systems' id="startctx" content="Listen to room"/>
                <Button icon='sign out' id="disconnect" content="disconnect"/>
                <Button icon='microphone' id="talkback" content="Hold to talk"/>
            </Button.Group>
            <h4>Controls</h4>
            <Button.Group>
                <Button icon='play' content='Play' id="startUserPlayer"/>
                <Button icon='pause' content='Pause' id="pauseUserPlayer"/>
                <Button icon='Shuffle' content='Stop' id="stopUserPlayer"/>
                <Button icon='fast backward' content='-30' id="rewind"/>
                <Button icon='fast forward' content='+30' id="fforward"/>
            </Button.Group>
        </Segment>
        )
    }
    getUiElements = () => {
        startCtx = document.getElementById('startctx');
        disconnectButton = document.getElementById('disconnect');
        adminPlayer = document.querySelector('audio');
        talkBackButton = document.getElementById('talkback');
        userMicGainSlider = document.querySelector('#micGain');
        userPlayerGainSlider = document.querySelector('#playerGain');
        startUserPlayerBtn = document.getElementById('startUserPlayer');
        pauseUserPlayerBtn = document.getElementById('pauseUserPlayer');
        stopUserPlayerBtn = document.getElementById('stopUserPlayer');
        timeDisplay = document.getElementById('timeDisplay');
        rewind = document.getElementById('rewind');
        fforward = document.getElementById('fforward');
        oscActive = document.getElementById('oscActive');
        oscGain = document.getElementById('oscGain');
    }
    initAudioContext = () => {
        startCtx.addEventListener('click', () => {
            startCtx.setAttribute('disabled', true);
            disconnectButton.removeAttribute('disabled');
            this.setupAdminMic();
        });
    }
    setupControlsListeners = () => {
        console.log("setup control listeners");
        oscActive.addEventListener('change', (e) => {
            console.log("Value: ", e.target.value);
            if(e.target.value === "on"){
                oscActive.setAttribute('value', "off");
            } else {
                oscActive.setAttribute('value', "on");
            }
            this.context.currentConnection.send({cmd: "osc state", value: e.target.value});
        })
        oscGain.addEventListener('change', (e) => {
            console.log("Value: ", e.target.value);
            this.context.currentConnection.send({cmd: "osc gain", value: e.target.value / 10000 });
        })
        userMicGainSlider.addEventListener('change', (e) => {
            console.log("Value: ", e.target.value);
            this.context.currentConnection.send({cmd: "mic gain", value: e.target.value / 100 });
        });
        userPlayerGainSlider.addEventListener('change', (e) => {
            console.log("Value: ", e.target.value);
            this.context.currentConnection.send({cmd: "player gain", value: e.target.value / 100 });
        });
        talkBackButton.addEventListener('mousedown', () => {
            adminMicGain.gain.value = 0.7;
            console.log(adminMicGain.gain.value)
            this.context.currentConnection.send("Talkback open")
        });
        talkBackButton.addEventListener('mouseup', () => {
            adminMicGain.gain.value = 0;
            console.log(adminMicGain.gain.value)
            this.context.currentConnection.send("Talkback closed")
        });
        startUserPlayerBtn.addEventListener('click', () => {
            this.context.currentConnection.send({cmd: "player start"})
            startUserPlayerBtn.setAttribute('disabled', true);
            stopUserPlayerBtn.removeAttribute('disabled');
            pauseUserPlayerBtn.removeAttribute('disabled');
            rewind.removeAttribute('disabled');
            fforward.removeAttribute('disabled');
        });
        pauseUserPlayerBtn.addEventListener('click', () => {
            this.context.currentConnection.send({cmd: "player pause"});
            pauseUserPlayerBtn.setAttribute('disabled', true);
            startUserPlayerBtn.removeAttribute('disabled');
        });
        stopUserPlayerBtn.addEventListener('click', () => {
            this.context.currentConnection.send({cmd: "player stop"});
            stopUserPlayerBtn.setAttribute('disabled', true);
            pauseUserPlayerBtn.setAttribute('disabled', true);
            startUserPlayerBtn.removeAttribute('disabled');
        });
        rewind.addEventListener('click', () => {
            this.context.currentConnection.send({cmd: "rewind"});
        });
        fforward.addEventListener('click', () => {
            this.context.currentConnection.send({cmd: "fforward"});
        })
    }
    setupAdminMic = async () => {
        ctx = await new AudioContext();
        navigator.mediaDevices.getUserMedia({audio: true})
            .then((micStream) => {
            outputToUser = ctx.createMediaStreamDestination();
            let micSource = ctx.createMediaStreamSource(micStream);
            adminMicGain = ctx.createGain();
            adminMicGain.gain.value = 0;
            micSource.connect(adminMicGain);
            adminMicGain.connect(outputToUser);
            this.callToUser()
        })
        .catch(err => console.error(err))
    }
    callToUser = () => {
        console.log(this.context);
        let call = this.context.peer.call(this.context.selectedRoom.username, outputToUser.stream);
        this.context.setCurrentCall(call);
        disconnectButton.addEventListener('click', () => {
            startCtx.removeAttribute('disabled');
            disconnectButton.setAttribute('disabled', true);
            // call.close();
            this.context.hangCurrentCall();
        });
        call.on('stream', stream => {
            console.log("Got Stream...")
            adminPlayer.srcObject = stream;
            adminPlayer.play();
        })
        call.on('close', () => {
            console.log("CALL CLOSED");
        });
        call.on('error', (err) => {
            console.log(err);
        });
    }
    handlePeerData = () => {
        this.context.peer.on('connection', (conn) => {
            console.log("GOT CONNTECTION!")
            conn.on('data', (data) => {
                console.log(data);
                if(data.cmd === "update"){
                    userMicGainSlider.value = data.micGain * 100;
                    userPlayerGainSlider.value = data.playerGain * 100;
                }
            });
        });
    }
    componentDidMount(){
            this.getUiElements();
            this.initAudioContext();
            this.setupControlsListeners();
            this.handlePeerData();
    }
    renderUserPlayerTime = () => {
        if(this.context.connData.playerTime){
            let min = Math.floor(this.context.connData.playerTime / 60)
            let sec = Math.round(this.context.connData.playerTime - min * 60);
            let timeString = `${min}:${sec}`;
            return <div>Current Player Time: <span id="timeDisplay">{timeString}</span></div>
        } else {
            return <div>Current Player Time: <span id="timeDisplay">0:0</span></div>
        }
    }
    render(){
        
        return(
            <div>
                <h1>{this.context.selectedRoom.username}</h1>
                <h4>Room Controls</h4>
                {this.renderUserPlayerTime()}
                <audio controls={true} crossorigin="anonymous"></audio>
                {this.renderOscControls()}
                {this.renderPlayerControls()}
                {this.renderRoomMixControls()}
            </div>
        )
    }
}

RoomControls.contextType = adminContext;
export default RoomControls;