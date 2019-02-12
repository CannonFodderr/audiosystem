import React, {Component} from 'react';
import {serverAPI} from '../api/api';
const Context = React.createContext();

export class AppContextStore extends Component{
    state = {
        room: null
    }
    setRoom = room => {
        this.setState({room});
    }
    fetchRoomData = loginData => {
        serverAPI.post('/login', loginData)
        .then((res) => {
            if(res.data.room){
                this.setRoom(res.data.room)
            }
        });
    }
    render(){
        return(
            <Context.Provider value={{
                ...this.state,
                fetchRoomData: this.fetchRoomData
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}


export default Context;