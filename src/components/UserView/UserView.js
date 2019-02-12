import React, {Component} from 'react';
import {Button, Icon} from 'semantic-ui-react';
import userContext from '../../contexts/userContext';



class UserView extends Component{
    renderView = () => {
        let room = this.props.room;
        if(!room || !room.currentUser || !room.currentBook || !room.currentPart ){
            return (
                <Button 
                id="refresh" 
                content="Reload" 
                negative 
                size="massive"
                onClick={() => {window.location.reload()}}
                />
            )
        } else {
            let isDisabled = this.context.isAdminConnected ? true : false;
            let content = isDisabled ? <Icon name="headphones" /> : 'Ready'
            return(
                <div>
                <Button 
                id="startctx" 
                content={content}
                primary 
                size="massive" 
                onClick={() => {this.context.initUserPlayback(document.getElementById('userPlayer'))}}
                disabled={isDisabled}
                />
                <div>
                    <audio src="/api/audio" id="userPlayer" crossorigin="anonymous"></audio>
                    <audio id="adminMicPlayer" crossorigin="anonymous"></audio>
                </div>
            </div>
            )
        }
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

