import React from 'react';
import {Button, Segment, Icon, Header, ButtonGroup} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';
const Peer = window.Peer;

let ctx;
let adminMicGain;
let outputToUser;
let startCtx;
let disconnectButton;
let adminPlayer;
let talkBackButton;
let userMicGainSlider;
let timeDisplay;
let userPlayerGainSlider;
let startUserPlayerBtn;
let pauseUserPlayerBtn;
let stopUserPlayerBtn;
let rewind 
let fforward;
let oscActive;
let oscGain;

class RoomControls extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            call: null
        }
    }
    renderRoomMixControls = () => {
        return(
            <Segment inverted>
                <h4>Mic Volume</h4>
                <input
                id="micGain"
                min={1}
                max={100}
                name='micGain'
                step={1}
                type='range'
                defaultValue={this.context.userMicGainSlider}
                style={{width:"100%"}}
                />
                <h4>Sound Volume</h4>
                <input 
                id="playerGain"
                min={1}
                max={100}
                name='playerGain'
                step={1}
                type='range'
                defaultValue={this.context.userPlayerGainSlider}
                style={{width:"100%"}}
                />
            </Segment>
        )
    }
    renderOscControls = () => {
        return(
            <Segment inverted>
                <h4>OSC</h4>
                <input type="checkbox" id="oscActive" value="on" defaultChecked />
                <input 
                id="oscGain"
                min={1}
                max={100}
                name='oscGain'
                step={1}
                type='range'
                defaultValue={70}
                style={{width:"100%"}}
                />
            </Segment>
        )
    }
    renderPlayerControls = () => {
        let isDisabled = this.context.onlineRooms.includes(this.context.selectedRoom.username) ? false : true;
        return (
        <Segment inverted>
            <h4>Connection</h4>
            <Button.Group className="ui two buttons">
                <Button icon='assistive listening systems' id="startctx" content="Listen" color="blue" disabled={isDisabled}/>
                <Button icon='sign out' id="disconnect" content="disconnect" color="red"/>
            </Button.Group>
            <h4>Talkback</h4>
            <ButtonGroup fluid>
                <Button size="large" icon='microphone' id="talkback" content="" color="blue"/>
            </ButtonGroup>
            <h4>Controls</h4>
            <Button.Group className="ui five buttons">
                <Button icon='play' content='' id="startUserPlayer"/>
                <Button icon='pause' content='' id="pauseUserPlayer"/>
                <Button icon='stop' content='' id="stopUserPlayer"/>
                <Button icon='fast backward' content='' id="rewind"/>
                <Button icon='fast forward' content='' id="fforward"/>
            </Button.Group>
        </Segment>
        )
    }
    initUiElements = () => {
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
        this.disableUiElements();
    }
    disableUiElements = () => {
        startCtx.removeAttribute('disabled');
        disconnectButton.setAttribute('disabled', true);
        talkBackButton.setAttribute('disabled', true);
        startUserPlayerBtn.setAttribute('disabled', true);
        pauseUserPlayerBtn.setAttribute('disabled', true);
        stopUserPlayerBtn.setAttribute('disabled', true);
        rewind.setAttribute('disabled', true);
        fforward.setAttribute('disabled', true);
        userMicGainSlider.setAttribute('disabled', true);
        userPlayerGainSlider.setAttribute('disabled', true);
    }
    enableUiElements = () => {
        startCtx.setAttribute('disabled', true);
        startUserPlayerBtn.removeAttribute('disabled');
        disconnectButton.removeAttribute('disabled');
        talkBackButton.removeAttribute('disabled');
        pauseUserPlayerBtn.removeAttribute('disabled');
        stopUserPlayerBtn.removeAttribute('disabled');
        rewind.removeAttribute('disabled');
        fforward.removeAttribute('disabled');
        userMicGainSlider.removeAttribute('disabled');
        userPlayerGainSlider.removeAttribute('disabled');
    }
    initAudioContext = () => {
        startCtx.addEventListener('click', () => {
            this.setupAdminMic()
            .then(() => {
                this.callToUser();
            })
        });
    }
    setupControlsListeners = () => {
        oscActive.addEventListener('change', (e) => {
            this.context.currentConnection.send({cmd: "osc state", value: e.target.checked});
        })
        oscGain.addEventListener('change', (e) => {
            this.context.currentConnection.send({cmd: "osc gain", value: e.target.value / 10000 });
        })
        userMicGainSlider.addEventListener('change', (e) => {
            this.context.currentConnection.send({cmd: "mic gain", value: e.target.value / 100 });
        });
        userPlayerGainSlider.addEventListener('change', (e) => {
            this.context.currentConnection.send({cmd: "player gain", value: e.target.value / 100 });
        });
        talkBackButton.addEventListener('mousedown', () => {
            talkBackButton.style.background = "orange"
            adminMicGain.gain.value = 0.7;
            this.context.currentConnection.send("Talkback open")
        });
        talkBackButton.addEventListener('mouseup', () => {
            talkBackButton.style.background = "#2185d0"
            adminMicGain.gain.value = 0;
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
        ctx = await new(window.AudioContext || window.webkitAudioContext)();
        await navigator.mediaDevices.getUserMedia({audio: true})
            .then((micStream) => {
            outputToUser = ctx.createMediaStreamDestination();
            let micSource = ctx.createMediaStreamSource(micStream);
            adminMicGain = ctx.createGain();
            adminMicGain.gain.value = 0;
            micSource.connect(adminMicGain);
            adminMicGain.connect(outputToUser);
        })
        .catch(err => console.error(err))
    }
    callToUser = async () => {
        this.setState({call: this.context.peer.call(this.context.selectedRoom.username, outputToUser.stream)});
        disconnectButton.addEventListener('click', () => {
            this.endCurrentCall();
        });
        this.context.setCurrentCall(this.state.call.peer)
        this.state.call.on('stream', stream => {
            console.log("Got Stream...")
            this.enableUiElements();
            adminPlayer.srcObject = stream;
            adminPlayer.play();
        })
        this.state.call.on('error', (err) => {
            console.log(err);
        });
    }
    componentDidMount(){
            this.initUiElements();
            this.initAudioContext();
            this.setupControlsListeners();
    }
    renderUserPlayerTime = () => {
        if(this.context.connData && this.context.connData.playerTime){
            let min = Math.floor(this.context.connData.playerTime / 60)
            let sec = Math.round(this.context.connData.playerTime - min * 60);
            let timeString = `${min}:${sec}`;
            return (
                <Segment inverted>
                    <Header>Current Player Time: <span id="timeDisplay">{timeString}</span></Header>
                </Segment>
                )
        } else {
            return (
                <Segment inverted>
                    <Header>Current Player Time: <span id="timeDisplay">0:0</span></Header>
                </Segment>
            )
        }
    }
    componentWillUnmount(){
        this.endCurrentCall();
    }
    endCurrentCall = () => {
        if(this.state.call){
            console.log("Call Ended...");
            this.state.call.close();
            if(ctx){
                ctx.close().then(() => {
                    ctx = null;
                })
            }
            this.disableUiElements();
            this.setState({call: null});
            this.context.setCurrentCall(null);
        }
    }
    render(){
        return(
            <Segment inverted>
                <audio crossorigin="anonymous"></audio>
                {this.renderUserPlayerTime()}
                {this.renderPlayerControls()}
                {this.renderRoomMixControls()}
                {this.renderOscControls()}
            </Segment>
        )
    }
}

RoomControls.contextType = adminContext;
export default RoomControls;