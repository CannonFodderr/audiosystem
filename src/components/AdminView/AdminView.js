import React from 'react';
import RoomList from '../RoomList/RoomList';
import UsersList from '../UsersList/UsersList';
import BooksList from '../BooksList/BooksList';
import NavBar from '../NavBar/NavBar';
import UserCreateForm from '../UserCreateForm/UserCreateForm';
import ModalTemlate from '../Modal/Modal';
import adminContext from '../../contexts/adminContext';

class AdminView extends React.Component{
    renderUserModal = () => {
        console.log("Open Modal")
        return <ModalTemlate header="Add User" content={<UserCreateForm />} actions=""/>
    }
    renderDisplayContent = () => {
        if(!this.context.activeMenuItem){
            return <div>Loading...</div>
        }
        if(this.context.activeMenuItem === "Rooms"){
            if(this.context.showCreateUserForm){
                return 
            }
            return <RoomList rooms={this.context.rooms}/>
        }
        if(this.context.activeMenuItem === "Books"){
            return <BooksList />
        }
        if(this.context.activeMenuItem === "Users"){
            if(this.context.showModal){
                return <ModalTemlate header="Create user" content={<UserCreateForm/>} />
            } else {
                return <UsersList />
            }
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