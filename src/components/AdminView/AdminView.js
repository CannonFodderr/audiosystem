import React from 'react';
import RoomList from '../RoomList/RoomList';
import RoomControls from '../RoomControls/RoomControls';
import adminContext from '../../contexts/adminContext';
import RoomEdit from '../RoomEdit/RoomEdit';

class AdminView extends React.Component{
    renderRoomControlsOrEdit = () => {
        if(!this.context.selectedRoom){
            return <div></div>
        } else if(this.context.selectedRoom && this.context.editRoom){
            return <RoomEdit />
        } else {
            return <RoomControls />
        }
    }
    render(){
        return(
            <div>
                <RoomList />
                {this.renderRoomControlsOrEdit()}
            </div>
        )
    }
}
AdminView.contextType = adminContext;
export default AdminView;