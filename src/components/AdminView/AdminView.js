import React from 'react';
import RoomList from '../RoomList/RoomList';
import UsersList from '../UsersList/UsersList';
import BooksList from '../BooksList/BooksList';
import NavBar from '../NavBar/NavBar';
import adminContext from '../../contexts/adminContext';

class AdminView extends React.Component{
    renderDisplayContent = () => {
        if(!this.context.activeMenuItem){
            return <div>Loading...</div>
        }
        if(this.context.activeMenuItem === "Rooms"){
            return <RoomList rooms={this.context.rooms}/>
        }
        if(this.context.activeMenuItem === "Books"){
            return <BooksList />
        }
        if(this.context.activeMenuItem === "Users"){
            return <UsersList />
        }
    }
    render(){
        return(
            <div>
                <NavBar />
                {this.renderDisplayContent()}
            </div>
        )
    }
}
AdminView.contextType = adminContext;
export default AdminView;