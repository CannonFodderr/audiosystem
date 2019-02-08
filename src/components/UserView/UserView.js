import React, {Component} from 'react';
import {Button} from 'semantic-ui-react';
const Peer = window.Peer;


class UserView extends Component{
    renderView = () => {
        return(
            <div>
                <Button id="startctx" content="Start" />
                <div>
                    <audio src="/api/audio" id="userPlayer" crossorigin="anonymous"></audio>
                    <audio id="adminMicPlayer" crossorigin="anonymous"></audio>
                </div>
            </div>
        )
    }
    componentDidMount(){
        const pitchFinderScript = document.createElement("script");
        pitchFinderScript.src = "/pitchFinder.js";
        pitchFinderScript.async = true;
        document.body.appendChild(pitchFinderScript);
        const userScript = document.createElement("script");
        userScript.src = "/user.js";
        userScript.async = true;
        document.body.appendChild(userScript);
    }
    render(){
        return(
            <div>
                <h1 id="room-title">{this.props.room.username}</h1>
                <div className="content">
                    {this.renderView()}
                </div>
            </div>
        )
    }
}

export default UserView;

