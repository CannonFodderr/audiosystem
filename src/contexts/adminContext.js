import React, {Component} from 'react';
import {serverAPI} from '../api/api'
import PeerClient from 'peerjs';
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
    selectedRoom: null,
    editRoom: false,
    currentConnection: null,
    currentCall: null,
    connData: {},
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
    } 
    setPeerInitialized = isPeerInitialized => {
        this.setState({isPeerInitialized})
    }
    setSelectedRoom = selectedRoom =>{
        this.setState({selectedRoom, editRoom: false, currentCall: null, currentConnection: null, connData: null});
    }
    setCurrentConnection = currentConnection => {
        console.log("SET NEW CONNECTION");
        this.setState({currentConnection});
    }
    editSelectedRoom = selectedRoom => {
        this.setState({selectedRoom, editRoom: true, currentCall: null})
    }
    setPeerConnection = async () => {
        await this.setState({peer: new Peer('admin', peerConfig ), isPeerInitialized: true });
    }
    setCurrentCommand = cmd => {
        this.setState({cmd})
    }
    setCurrentCall = call => {
        if(!this.state.currentCall){
            this.setState({currentCall: call});
        }
    }
    hangCurrentCall = () => {
        if(this.state.currentCall){
            console.log("HANGING UP CURRENT CALL");
            this.setState({currentCall: null});
        }
    }
    componentDidMount(){
        this.setPeerConnection().then(()=>{
            this.state.peer.on('connection', (conn)=>{
                let newOnlineRoomsList = [...this.state.onlineRooms, conn.peer];
                this.setOnlineRooms(newOnlineRoomsList);
                conn.on('open', () => {
                    conn.send({cmd: "admin connect"});
                })
                conn.on('close', ()=>{
                    let newOnlineRoomsList = this.state.onlineRooms.filter(room => room !== conn.peer);
                    this.setOnlineRooms(newOnlineRoomsList);
                });
                conn.on('data', (data) => {
                    if(data.cmd ==="update"){
                        this.setState({connData: data})
                    }
                    if(data.cmd === "user answered"){
                        this.setCurrentConnection(conn)
                    }
                });
            })
            this.getAllRooms()
        })
        .catch(err => console.log(err))
    }
    componentWillUnmount(){
        this.state.peer.destroy();
    }
    render(){
        // console.log(this.state);
        return(
            <Context.Provider value={{
                ...this.state,
                setPeerInitialized: this.setPeerInitialized,
                setSelectedRoom: this.setSelectedRoom,
                setCurrentConnection: this.setCurrentConnection,
                setCurrentCommand: this.setCurrentCommand,
                setCurrentCall: this.setCurrentCall,
                hangCurrentCall: this.hangCurrentCall,
                editSelectedRoom: this.editSelectedRoom,
                getAllRooms: this.getAllRooms
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

export default Context;