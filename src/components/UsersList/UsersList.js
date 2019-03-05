import React, {Component} from 'react';
import {Card, Icon, Button} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

class UsersList extends Component{
    deleteUser = user => {
        serverAPI.delete(`/users/${user._id}`)
        .then(() => {
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
                            <Button size="small" negative onClick={() => {
                                this.deleteUser(user)
                            }}>
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
    componentDidMount(){
        this.context.fetchUsersList()
    }
    render(){
        return (
            <div>
                <Card.Group>
                    {this.renderUsersList()}
                </Card.Group>
            </div>
        )
    }
}

UsersList.contextType = adminContext;
export default UsersList;