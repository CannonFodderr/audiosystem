import React, {Component} from 'react';
import {serverAPI} from '../api/api'
const Context = React.createContext();
const Peer = window.Peer;

const peerConfig = {
    host: window.location.hostname, 
    port: '8080', 
    path: '/peerjs', 
    sdpSemantics: 'unified-plan',
    debug: 0,
}
const INITIAL_STATE = {
    peer: null,
    isPeerInitialized: false,
    rooms: [],
    onlineRooms: [],
    selectedRoom: null
}

export class AdminContextStore extends Component{
    constructor(props){
        super(props)
        this.state = INITIAL_STATE;
    }
    getAllRooms = () => {
        serverAPI.get('/rooms')
        .then((res) => {
            this.setState({rooms: res.data});
        })
        .catch((err) => {console.log(err)});
    }
    setOnlineRooms = onlineRooms => {
        this.setState({onlineRooms});
        console.log(this.state.onlineRooms);
    } 
    setPeerInitialized = isPeerInitialized => {
        this.setState({isPeerInitialized})
    }
    setSelectedRoom = selectedRoom =>{
        this.setState({selectedRoom});
    }
    setPeerConnection = async () => {
        await this.setState({peer: new Peer('admin', peerConfig ), isPeerInitialized: true });
    }
    componentDidMount(){
        this.setPeerConnection().then(()=>{
            console.log(this.state.peer);
            this.state.peer.on('connection', (conn)=>{
                let newOnlineRoomsList = [...this.state.onlineRooms, conn.peer];
                this.setOnlineRooms(newOnlineRoomsList);
                conn.on('close', ()=>{
                    let newOnlineRoomsList = this.state.onlineRooms.filter(room => room !== conn.peer);
                    this.setOnlineRooms(newOnlineRoomsList);
                });
            })
            this.getAllRooms()
        })
    }
    componentWillUnmount(){
        this.state.peer.destroy();
        this.setState({peer: new Peer('admin', peerConfig ), isPeerInitialized: true });
    }
    render(){
        return(
            <Context.Provider value={{
                ...this.state,
                setPeerInitialized: this.setPeerInitialized,
                setSelectedRoom: this.setSelectedRoom
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

export default Context;