import React from 'react';
import RoomList from '../RoomList/RoomList';
import adminContext from '../../contexts/adminContext';

class AdminView extends React.Component{
    render(){
        return(
            <div>
                <RoomList rooms={this.context.rooms}/>
            </div>
        )
    }
}
AdminView.contextType = adminContext;
export default AdminView;