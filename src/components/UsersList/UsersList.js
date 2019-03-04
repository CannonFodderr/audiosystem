import React, {Component} from 'react';
import {Card} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

class UsersList extends Component{
    state = {users: []};

    renderUsersList = () => {
        let users = this.state.users;
        if(!users || users.length < 1){
            return <div>Loading users...</div>
        } else {
            return users.map(user => {
                return (
                    <Card key={user._id}>
                        <Card.Content>
                            <Card.Header as="a" >{user.firstName} {user.lastName}</Card.Header>
                        </Card.Content>
                    </Card>
                )
            })
        }
    }
    setCurrentUsers = users => {
        this.setState({users});
    }
    componentDidMount(){
        serverAPI.get('/users')
        .then(res => { this.setCurrentUsers(res.data)})
        .catch(err => { console.log(err)});
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