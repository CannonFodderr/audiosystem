import React, {Component} from 'react';
import {List} from 'semantic-ui-react';
import adminContext from '../../contexts/adminContext';

class RoomList extends Component{
    renderRoomlist = () => {
        if(this.context.rooms.length < 1){
            return <div>Loading rooms...</div>
        }
        return (
            <List divided relaxed>
                {this.context.rooms.map((room, index) => {
                    let color;
                    if(this.context.currentCall && this.context.currentCall === room.username){
                        color = 'orange';
                    } else {
                        color = this.context.onlineRooms.includes(room.username) ? 'green' : 'grey';
                    } 
                    if(room.isAdmin === true){
                        return
                    } else {
                        return (
                            <List.Item key={index} id={room._id}>
                                <List.Icon name='idea' size='large' verticalAlign='middle' color={color} />
                                <List.Content>
                                    <List.Header as='a'onClick={() => {this.context.setSelectedRoom(room)}}>{room.username}</List.Header>
                                    <List.Description as='a'>demo text for room later will be filled...</List.Description>
                                </List.Content>
                            </List.Item>
                        )
                    }
                })}
            </List>
        )
    }
    render(){
        return(
            <div>
                <h2>Room List</h2>
                {this.renderRoomlist()}
            </div>
        )
    }
}

RoomList.contextType = adminContext;
export default RoomList