import React, {Component} from 'react';
import {Button} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import userContext from '../../contexts/userContext';

const Peer = window.Peer;


class UserView extends Component{
    renderView = () => {
        let room = this.props.room;
        if(!room || !room.currentUser || !room.currentBook || !room.currentPart ){
            return (
                <Button id="refresh" content="Reload" negative size="massive"/>
            )
        } else {
            return(
                <div>
                <Button id="startctx" content="Ready" positive size="massive"/>
                <div>
                    <audio src="/api/audio" id="userPlayer" crossorigin="anonymous"></audio>
                    <audio id="adminMicPlayer" crossorigin="anonymous"></audio>
                </div>
            </div>
            )
        }
    }
    componentDidMount(){
        let startctx = document.getElementById('startctx');
        startctx.addEventListener('click', () => {
            this.context.initUserPlayback(document.getElementById('userPlayer'))
        })
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

UserView.contextType = userContext;
export default UserView;

