import React from 'react';
import {Input, Button, Label, Checkbox, Segment} from 'semantic-ui-react';
import {Slider} from 'react-semantic-ui-range';

class RoomControls extends React.Component{
    renderRoomMixControls = () => {
        return(
            <Segment>
                <h4>Mic Volume</h4>
                <Input
                id="micGain"
                min={1}
                max={100}
                name='playerGain'
                step={1}
                type='range'
                value={50}
                />
                <h4>Sound Volume</h4>
                <Input 
                id="playerGain"
                min={1}
                max={100}
                name='playerGain'
                step={1}
                type='range'
                value={70}
              />
            </Segment>
        )
    }
    renderOscControls = () => {
        return(
            <Segment>
                <h4>OSC</h4>
                <Checkbox checked={true} id="oscActive" />
                <Input 
                id="oscGain"
                min={1}
                max={100}
                name='playerGain'
                step={1}
                type='range'
                value={70}/>
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
    componentDidMount(){
        const adminControlsScript = document.createElement("script");
        adminControlsScript.src = "/admin.js";
        adminControlsScript.async = true;
        document.body.appendChild(adminControlsScript);
    }
    render(){
        return(
            <div>
                <h4>Room Controls</h4>
                <div>Current Player Time: <span id="timeDisplay"></span></div>
                {this.renderOscControls()}
                {this.renderPlayerControls()}
                {this.renderRoomMixControls()}
                <audio controls={true} crossorigin="anonymous"></audio>
            </div>
        )
    }
}

export default RoomControls;