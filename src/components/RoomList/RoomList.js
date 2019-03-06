import React, {Component} from 'react';
import {Button, Card, Icon, Container} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';
import RoomEdit from '../RoomEdit/RoomEdit';
import RoomControls from '../RoomControls/RoomControls';

class RoomList extends Component{
    renderRoomControlsOrEdit = () => {
        if(!this.context.selectedRoom){
            return <div></div>
        } else if(this.context.selectedRoom && this.context.editRoom){
            return (
                <Card.Content>
                    <RoomEdit />
                </Card.Content>
            )
        } else {
            return (
                <Card.Content>
                    <RoomControls />
                </Card.Content>
            )
        }
    }
    renderCardExtraContent = (room) => {
        return(
            <Card.Content extra>
                <div className='ui two buttons'>
                    <Button basic color='blue' onClick={() => {this.context.setSelectedRoom(room)}}>View</Button>
                    <Button basic color='red' onClick={() => {this.context.editSelectedRoom(room)}}>Edit</Button>
                </div>
            </Card.Content>
        )
    }
    renderCardMeta = room => {
        if(!room.currentUser){
            return <Card.Meta></Card.Meta>
        } else {
            return <Card.Meta><Icon  name='user' /> {room.currentUser.firstName} {room.currentUser.lastName}</Card.Meta>
        }
    }
    renderCardDescription = room => {
        if(!room.currentBook){
            return <Card.Description></Card.Description>
        } else {
            return <Card.Description as='a'><Icon  name='book' /> {room.currentBook.name} <hr /> <Icon name="file audio" /> { room.currentPart }</Card.Description>
        }
        
    }
    renderCardContent = (room, color) => {
        return(
            <Card.Content>
                <Card.Header as='a'onClick={() => {this.context.setSelectedRoom(room)}}><Icon name='idea' color={color} size='small'/>{room.username}</Card.Header>
                {this.renderCardMeta(room)}
                {this.renderCardDescription(room)}
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
        if(!this.props.rooms || this.props.rooms.length < 1){
            return <div>Loading rooms...</div>
        }
        return (
            <Card.Group>
                {this.props.rooms.map((room, index) => {
                    let color = this.setStatusIconColor(room)
                    if(room.isAdmin === true){
                        return
                    } else if(this.context.selectedRoom && room.username === this.context.selectedRoom.username) {
                        return (
                            <Card color="blue" key={index} id={room._id} fluid={true}>
                                {this.renderCardContent(room, color)}
                                {this.renderCardExtraContent(room)}
                                {this.renderRoomControlsOrEdit()}
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
        // console.log(this.context);
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