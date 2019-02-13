import React from 'react';
import RoomList from '../RoomList/RoomList';
import adminContext from '../../contexts/adminContext';

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