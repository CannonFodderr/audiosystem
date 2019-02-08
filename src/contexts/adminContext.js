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
    selectedRoom: null,
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
            // this.state.currentCall.close();
            // this.setState({currentCall: null});
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
                    if(this.state.selectedRoom && conn.peer === this.state.selectedRoom.username){
                        if(this.state.currentConnection !== conn.peer){
                            if(this.state.currentCall){
                                this.state.currentCall.close()
                            }
                            this.setState({currentConnection: conn, currentCall: null});
                            if(data.cmd ==="update"){
                                this.setState({connData: data})
                            }
                        }
                    }
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
        // console.log(this.state);
        return(
            <Context.Provider value={{
                ...this.state,
                setPeerInitialized: this.setPeerInitialized,
                setSelectedRoom: this.setSelectedRoom,
                setCurrentCommand: this.setCurrentCommand,
                setCurrentCall: this.setCurrentCall,
                hangCurrentCall: this.hangCurrentCall
                }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

export default Context;