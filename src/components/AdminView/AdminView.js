import React from 'react';
import RoomList from '../RoomList/RoomList';
import RoomControls from '../RoomControls/RoomControls';
import adminContext from '../../contexts/adminContext';

class AdminView extends React.Component{
    renderRoomControls = () => {
        if(!this.context.selectedRoom || !this.context.onlineRooms.includes(this.context.selectedRoom.username)){
            return <div></div>
        } else {
            return <RoomControls room={this.context.selectedRoom}/>
        }
    }
    render(){
        return(
            <div>
                <h1>ADMIN VIEW</h1>
                <RoomList />
                {this.renderRoomControls()};
            </div>
        )
    }
}
AdminView.contextType = adminContext;
export default AdminView;