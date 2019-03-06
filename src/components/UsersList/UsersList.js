import React, {Component} from 'react';
import {Card, Icon, Button} from 'semantic-ui-react';
import ConfirmTemplate from '../Confirm/Confim';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

const INITIAL_STATE = { showConfirm: false, selectedUser: null}

class UsersList extends Component{
    state = INITIAL_STATE;
    handleConfirm = () => {
        this.deleteUser();
    }
    handleCancel = () => {
        this.setState({showConfirm: false, selectedUser: null})
    }
    deleteUser = () => {
        serverAPI.delete(`/users/${this.state.selectedUser._id}`)
        .then(() => {
            this.setState({showConfirm: false, selectedUser: null});
            this.context.fetchUsersList();
        })
        .catch(err => console.log(err));
    }
    renderUsersList = () => {
        let users = this.context.users;
        if(!users || users.length < 1){
            return <div>Loading users...</div>
        } else {
            return users.map(user => {
                if(user.isAdmin){
                    return
                }
                return (
                    <Card key={user._id}>
                        <Card.Content>
                            <Card.Header as="a" >{user.firstName} {user.lastName}</Card.Header>
                            <Card.Content extra>
                                
                                <Button size="small" negative onClick={() => {this.setState({showConfirm: true, selectedUser: user})}}>
                                    <Icon name="delete" />
                                    Delete
                                </Button>
                            </Card.Content>
                        </Card.Content>
                    </Card>
                )
            })
        }
    }
    renderContent = () => {
        if(!this.state.showConfirm && !this.state.selectedUser){
            return(
                <Card.Group>
                    {this.renderUsersList()}
                </Card.Group>
            )
        } else {
            let content = `Are you sure you want to delete "${this.state.selectedUser.firstName} ${this.state.selectedUser.lastName}" ?`;
            return (
            <div>
                <ConfirmTemplate 
                handleConfirm={this.handleConfirm} 
                handleCancel={this.handleCancel}
                header="Delete User"
                content={content}
                isopen={this.state.showConfirm}
                />
            </div>
            )
        }
    }
    componentDidMount(){
        this.context.fetchUsersList()
    }
    render(){
        return (
            <div>
                {this.renderContent()}
            </div>
        )
    }
}

UsersList.contextType = adminContext;
export default UsersList;