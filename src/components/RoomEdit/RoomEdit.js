import React, {Component} from 'react';
import {Button, Container, Segment, List, Select, Confirm} from 'semantic-ui-react';
import {serverAPI} from '../../api/api';
import adminContext from '../../contexts/adminContext';

let INITIAL_STATE = {
    allUsers: null,
    allBooks: null,
    currentUser: null,
    currentBook: null,
    currentPart: null
}

class RoomEdit extends Component{
    state = INITIAL_STATE;
    renderCurrentRoomData = () => {
        let listArr = []
        for(let key in this.context.selectedRoom){
            listArr.push(key);
        };
        return listArr.map((key, index) => {
            return <List.Item key={key}>{key}: {this.context.selectedRoom[key]}</List.Item>
        });
    }
    renderUserSelection = () => {
        if(!this.state.allUsers){
            return <option>Loading Users...</option>
        } else {
            return this.state.allUsers.map((user) => {
                return <option id={user._id} key={user._id}>{user.firstName} {user.lastName}</option>
            })
        }
    }
    renderBookSelection = () => {
        if(!this.state.allBooks){
            return <option>Loading Books Data...</option>
        } else {
            return this.state.allBooks.map((book) => {
                return <option id={book._id} key={book._id}>{book.name}</option>
            })
        }
    }
    requestUsersList = () => {
        serverAPI.get('/users')
        .then((res) => {
            this.setState({allUsers: res.data})
        })
        .catch(err => console.log(err));
    }
    requestBooksList = () => {
        serverAPI.get('/books')
        .then((res) => {
            this.setState({allBooks: res.data})
        })
        .catch(err => console.log(err));
    }
    updateCurrentRoomData = () => {
        let data = {
            currentUser: this.state.currentUser,
            currentBook: this.state.currentBook,
            currentPart: this.state.currentPart
        }
        
        serverAPI.put(`/rooms/${this.context.selectedRoom._id}`, data).then((res) => {
            console.log(res.data);
            this.context.getAllRooms();
        })
        .catch(err => console.log(err));
    }
    clearCurrentRoomData = () => {
        this.setState({
            currentUser: null,
            currentBook: null,
            currentPart: null
        })
        this.updateCurrentRoomData();
    }
    componentDidMount(){
        this.requestUsersList();
        this.requestBooksList();
    }
    renderCurrentUserOption = () => {
        if(!this.context.selectedRoom.currentUser){
            return <option id={null}>Select</option>
        } else {
            return <option id={this.context.selectedRoom.currentUser._id}>Keep Current User</option>
        }
    }
    renderCurrentBookOption = () => {
        if(!this.context.selectedRoom.currentBook){
            return <option id={null}>Select</option>
        } else {
            return <option id={this.context.selectedRoom.currentBook._id}>Keep Current Book</option>
        }
    }
    render(){
        // console.log(this.state);
        return(
            <Container>
                <Segment inverted>
                    <h4>Room Edit</h4>
                    <h4>Select User</h4>
                    <select onChange={(e) => { 
                        this.setState({ currentUser: e.target.selectedOptions[0].id})}}>
                        {this.renderCurrentUserOption()}
                        {this.renderUserSelection()}
                    </select>
                    <h4>Select Book</h4>
                    <select onChange={(e) => { 
                        this.setState({currentBook: e.target.selectedOptions[0].id})}}>
                        {this.renderCurrentBookOption()}
                        {this.renderBookSelection()}
                    </select>
                    <hr />
                    <Button primary onClick={() => this.updateCurrentRoomData()}>Change</Button>
                    <Button negative onClick={() => this.clearCurrentRoomData()}>Clear</Button>
                </Segment>
            </Container>
        )
    }
}

RoomEdit.contextType = adminContext;
export default RoomEdit;
