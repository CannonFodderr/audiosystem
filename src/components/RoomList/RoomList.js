import React, {Component} from 'react';
import {List, Button, Card, Icon, Container} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';

class RoomList extends Component{
    renderCardExtraContent = (room) => {
        return(
            <Card.Content extra>
                <div className='ui two buttons'>
                    <Button basic color='blue' onClick={() => {this.context.setSelectedRoom(room)}}>View</Button>
                    <Button basic color='red'>Edit</Button>
                </div>
            </Card.Content>
        )
    }
    renderCardContent = (room, color) => {
        return(
            <Card.Content>
                <Card.Header as='a'onClick={() => {this.context.setSelectedRoom(room)}}><Icon name='idea' floated="right" size='large' verticalAlign='middle' color={color} />{room.username}</Card.Header>
                <Card.Meta>Friends of Elliot</Card.Meta>
                <Card.Description as='a'>demo text for room later will be filled...</Card.Description>
            </Card.Content>
        )
    }
    setStatusIconColor = room => {
        if(this.context.currentCall && this.context.currentCall === room.username){
            return 'orange';
        } else {
            return this.context.onlineRooms.includes(room.username) ? 'green' : 'grey';
        } 
    }
    renderRoomlist = () => {
        if(this.context.rooms.length < 1){
            return <div>Loading rooms...</div>
        }
        return (
            <Card.Group>
                {this.context.rooms.map((room, index) => {
                    // console.log(room);
                    let color = this.setStatusIconColor(room)
                    if(room.isAdmin === true){
                        return
                    } else if(this.context.selectedRoom && room.username === this.context.selectedRoom.username) {
                        return (
                            <Card color="blue" key={index} id={room._id}>
                                {this.renderCardContent(room, color)}
                                {this.renderCardExtraContent(room)}
                            </Card>
                        )
                    } else {
                        return (
                            <Card key={index} id={room._id}>
                                {this.renderCardContent(room, color)}
                                {this.renderCardExtraContent(room)}
                            </Card>
                        )
                    }
                })}
            </Card.Group>
        )
    }
    render(){
        console.log(this.context);
        return(
            <Container>
                <h2>Room List</h2>
                {this.renderRoomlist()}
            </Container>
        )
    }
}

RoomList.contextType = adminContext;
export default RoomList