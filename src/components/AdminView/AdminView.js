import React from 'react';
import RoomList from '../RoomList/RoomList';
import RoomControls from '../RoomControls/RoomControls';
import adminContext from '../../contexts/adminContext';
import RoomEdit from '../RoomEdit/RoomEdit'; 

class AdminView extends React.Component{
    render(){
        return(
            <div>
                <RoomList />
            </div>
        )
    }
}
AdminView.contextType = adminContext;
export default AdminView;